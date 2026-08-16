import { useEffect, useState } from 'react';
import type { Profile, Experience, Education, Skill, Project, Tech } from './types';

/**
 * Performance-oriented data layer.
 *
 *  - Caches portfolio data in memory + localStorage (versioned, TTL-based) so a
 *    returning visitor gets an instant first paint with zero network requests.
 *  - Revalidates in the background (stale-while-revalidate) through a single
 *    combined `/api/home` endpoint, falling back to per-resource endpoints.
 *  - Deduplicates concurrent requests (single-flight) so React StrictMode and
 *    multiple consumers never issue duplicate network calls.
 *  - Throttles background revalidation and adds request timeouts so slow/failed
 *    servers never stall the UI.
 */

export interface PortfolioData {
  profile: Profile | null;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  tech: Tech[];
}

type ResourceKey = keyof PortfolioData;

interface HomePayload {
  profile: Profile | null;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  technologies: Tech[];
}

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const TTL_MS = 5 * 60 * 1000;
const REVALIDATE_THROTTLE_MS = 30 * 1000;
const REQUEST_TIMEOUT_MS = 8000;
const CACHE_STORAGE_KEY = 'anuk.portfolio.cache.v1';
const REVALIDATE_STORAGE_KEY = 'anuk.portfolio.revalidate.v1';

const RESOURCE_URLS: Record<ResourceKey, string> = {
  profile: '/api/profile',
  experience: '/api/experience',
  education: '/api/education',
  skills: '/api/skills',
  projects: '/api/projects',
  tech: '/api/technologies',
};

const memoryCache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<unknown>>();
let persistedStore: Record<string, CacheEntry> | null = null;

function getStore(): Record<string, CacheEntry> {
  if (persistedStore) return persistedStore;
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    persistedStore = raw ? (JSON.parse(raw) as Record<string, CacheEntry>) : {};
  } catch {
    persistedStore = {};
  }
  return persistedStore;
}

function saveStore() {
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(getStore()));
  } catch {
    /* storage full or unavailable */
  }
}

function readCache<T>(key: string): T | undefined {
  const now = Date.now();
  const mem = memoryCache.get(key);
  if (mem && mem.expiresAt > now) return mem.data as T;
  const entry = getStore()[key];
  if (entry && entry.expiresAt > now) {
    memoryCache.set(key, entry);
    return entry.data as T;
  }
  return undefined;
}

function writeCache<T>(key: string, data: T) {
  const entry: CacheEntry = { data, expiresAt: Date.now() + TTL_MS };
  memoryCache.set(key, entry);
  getStore()[key] = entry;
  saveStore();
}

async function fetchWithTimeout(url: string, ms = REQUEST_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/** Network fetch with single-flight dedup + stale fallback. */
async function fetchResource<T>(key: string, url: string): Promise<T> {
  const existing = inFlight.get(key);
  if (existing) return existing as Promise<T>;

  const promise = (async () => {
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    const data = (await res.json()) as T;
    writeCache(key, data);
    return data;
  })().catch(async (err: unknown) => {
    inFlight.delete(key);
    const stale = readCache<T>(key);
    if (stale !== undefined) return stale;
    throw err;
  });

  inFlight.set(key, promise);
  try {
    return await promise;
  } finally {
    inFlight.delete(key);
  }
}

/** Cache-first read; falls back to network only when nothing fresh exists. */
async function requestResource<T>(key: string, url: string): Promise<T> {
  const cached = readCache<T>(key);
  if (cached !== undefined) return cached;
  return fetchResource<T>(key, url);
}

const EMPTY_PORTFOLIO: PortfolioData = {
  profile: null,
  experience: [],
  education: [],
  skills: [],
  projects: [],
  tech: [],
};

function toPortfolio(payload: HomePayload): PortfolioData {
  return {
    profile: payload.profile,
    experience: payload.experience,
    education: payload.education,
    skills: payload.skills,
    projects: payload.projects,
    tech: payload.technologies,
  };
}

/**
 * Fetches the full portfolio, preferring the single combined endpoint and
 * transparently falling back to the six individual endpoints.
 */
export async function fetchPortfolio(forceRevalidate = false): Promise<PortfolioData> {
  try {
    const payload = forceRevalidate
      ? await fetchResource<HomePayload>('home', '/api/home')
      : await requestResource<HomePayload>('home', '/api/home');
    const data = toPortfolio(payload);
    writeCache('profile', data.profile);
    writeCache('experience', data.experience);
    writeCache('education', data.education);
    writeCache('skills', data.skills);
    writeCache('projects', data.projects);
    writeCache('tech', data.tech);
    return data;
  } catch {
    // Combined endpoint unavailable — fall back to individual endpoints.
  }

  const keys = Object.keys(RESOURCE_URLS) as ResourceKey[];
  const results = await Promise.allSettled(
    keys.map((k) =>
      forceRevalidate
        ? fetchResource(k, RESOURCE_URLS[k])
        : requestResource(k, RESOURCE_URLS[k])
    )
  );

  const data: PortfolioData = { ...EMPTY_PORTFOLIO };
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      (data as unknown as Record<string, unknown>)[keys[i]] = result.value;
    }
  });
  return data;
}

/** Fire-and-forget warm-up used by the idle prefetcher. */
export function prefetchPortfolio() {
  void fetchPortfolio(false).catch(() => {});
}

function hydrate(): { data: PortfolioData; ready: boolean } {
  let ready = false;
  const data: PortfolioData = { ...EMPTY_PORTFOLIO };

  const home = readCache<HomePayload>('home');
  if (home) {
    Object.assign(data, toPortfolio(home));
    ready = true;
  }

  (Object.keys(RESOURCE_URLS) as ResourceKey[]).forEach((k) => {
    const value = readCache<unknown>(k);
    if (value !== undefined) {
      (data as unknown as Record<string, unknown>)[k] = value;
      ready = true;
    }
  });

  return { data, ready };
}

/** Throttles forced revalidation so quick re-mounts don't spam the network. */
function canRevalidate(): boolean {
  try {
    const last = Number(localStorage.getItem(REVALIDATE_STORAGE_KEY) || 0);
    if (Date.now() - last < REVALIDATE_THROTTLE_MS) return false;
    localStorage.setItem(REVALIDATE_STORAGE_KEY, String(Date.now()));
    return true;
  } catch {
    return true;
  }
}

/**
 * SWR-style hook: paints instantly from cache (when available), revalidates in
 * the background, and surfaces a `ready`/`loading`/`error` tri-state.
 */
export function usePortfolioData() {
  const [hydrated] = useState(() => hydrate());
  const [data, setData] = useState<PortfolioData>(hydrated.data);
  const [ready, setReady] = useState<boolean>(hydrated.ready);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    const run = async () => {
      const force = canRevalidate();
      try {
        const fresh = await fetchPortfolio(force);
        if (!active) return;
        setData(fresh);
        setReady(true);
        setError(false);
      } catch {
        if (!active) return;
        setReady(true);
        if (!hydrated.ready) setError(true);
      }
    };

    void run();
    return () => {
      active = false;
    };
  }, [hydrated]);

  return { data, ready, loading: !ready, error };
}
