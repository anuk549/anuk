import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LogOut, Plus, Trash2, Save, Upload, User, Briefcase, GraduationCap, Code2,
  FolderKanban, Mail, ExternalLink, Github, BookOpen, ChevronLeft, ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { authFetch } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading';
import { playClickSound } from '../lib/sound';
import { defaultBio, mergeBio, type BioData } from '../lib/bio';
import type { Profile, Experience, Education, Skill, Message, Project } from '../lib/types';

type Tab = 'profile' | 'bio' | 'experience' | 'education' | 'skills' | 'projects' | 'messages';

const tabs: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'bio', label: 'Bio', icon: BookOpen },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'skills', label: 'Skills', icon: Code2 },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'messages', label: 'Messages', icon: Mail },
];

export default function Admin() {
  const { token, setToken } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('profile');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bio, setBio] = useState<BioData>(defaultBio);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2500);
  };

  const loadAll = useCallback(async () => {
    try {
      const [p, b, e, ed, s, pr, m] = await Promise.all([
        fetch('/api/profile').then(r => r.json()),
        fetch('/api/bio').then(r => r.json()),
        fetch('/api/experience').then(r => r.json()),
        fetch('/api/education').then(r => r.json()),
        fetch('/api/skills').then(r => r.json()),
        fetch('/api/projects').then(r => r.json()),
        authFetch('/api/messages').then(r => r.json()),
      ]);
      setProfile(p);
      setBio(mergeBio(b));
      setExperience(Array.isArray(e) ? e : []);
      setEducation(Array.isArray(ed) ? ed : []);
      setSkills(Array.isArray(s) ? s : []);
      setProjects(Array.isArray(pr) ? pr : []);
      setMessages(Array.isArray(m) ? m : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadAll(); }, [loadAll]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const signOut = () => {
    playClickSound();
    localStorage.removeItem('admin_token');
    setToken(null);
    navigate('/login');
  };

  // --- Profile ---
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    const body = profile?._id ? profile : { ...profile, _id: undefined };
    const res = await authFetch('/api/profile', { method: 'PUT', body: JSON.stringify(body) });
    if (res.ok) { notify('Profile saved'); void loadAll(); } else notify('Error saving profile');
  };

  const uploadAvatar = async (file: File) => {
    playClickSound();
    const base64 = await fileToBase64(file);
    const res = await authFetch('/api/upload', { method: 'POST', body: JSON.stringify({ fileName: file.name, fileBase64: base64, contentType: file.type }) });
    const data = await res.json();
    if (res.ok) setProfile(p => p ? { ...p, avatar_url: data.url } : p);
    else notify(data.error || 'Upload failed');
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    playClickSound();
    const base64 = await fileToBase64(file);
    const res = await authFetch('/api/upload', { method: 'POST', body: JSON.stringify({ fileName: file.name, fileBase64: base64, contentType: file.type }) });
    const data = await res.json();
    if (!res.ok) { notify(data.error || 'Upload failed'); return null; }
    return data.url as string;
  };

  const uploadLogo = async (file: File) => {
    const url = await uploadImage(file);
    if (url) setProfile(p => p ? { ...p, logo_url: url } : p);
  };

  const saveBio = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    const res = await authFetch('/api/bio', { method: 'PUT', body: JSON.stringify(bio) });
    if (res.ok) { notify('Bio saved'); void loadAll(); }
    else {
      const data = await res.json().catch(() => ({}));
      notify(data.error || 'Error saving bio');
    }
  };

  const uploadBioImage = async (file: File) => {
    playClickSound();
    const base64 = await fileToBase64(file);
    const res = await authFetch('/api/upload', { method: 'POST', body: JSON.stringify({ fileName: file.name, fileBase64: base64, contentType: file.type }) });
    const data = await res.json();
    if (res.ok) setBio(b => ({ ...b, university_image_url: data.url }));
    else notify(data.error || 'Upload failed');
  };

  const uploadCareerImage = async (file: File) => {
    playClickSound();
    const base64 = await fileToBase64(file);
    const res = await authFetch('/api/upload', { method: 'POST', body: JSON.stringify({ fileName: file.name, fileBase64: base64, contentType: file.type }) });
    const data = await res.json();
    if (res.ok) setBio(b => ({ ...b, career_image_url: data.url }));
    else notify(data.error || 'Upload failed');
  };

  // --- Experience ---
  const addExperience = async () => {
    playClickSound();
    const res = await authFetch('/api/experience', { method: 'POST', body: JSON.stringify({ company: 'New Company', role: 'Role', period: '', points: [], icon: 'Briefcase', link: '' }) });
    if (res.ok) { notify('Experience added'); void loadAll(); }
  };
  const updateExperience = async (item: Experience) => {
    playClickSound();
    const res = await authFetch('/api/experience', { method: 'PUT', body: JSON.stringify(item) });
    if (res.ok) notify('Saved'); else notify('Error');
  };
  const deleteExperience = async (_id: string) => {
    playClickSound();
    const res = await authFetch('/api/experience', { method: 'DELETE', body: JSON.stringify({ _id }) });
    if (res.ok) { notify('Deleted'); void loadAll(); }
  };

  const uploadExperienceLogo = async (i: number, file: File) => {
    const url = await uploadImage(file);
    if (url) setExperience(prev => prev.map((x, idx) => idx === i ? { ...x, logo_url: url } : x));
  };

  // --- Education ---
  const addEducation = async () => {
    playClickSound();
    const res = await authFetch('/api/education', { method: 'POST', body: JSON.stringify({ institution: 'New Institution', degree: 'Degree', period: '', description: '', icon: 'GraduationCap', link: '' }) });
    if (res.ok) { notify('Education added'); void loadAll(); }
  };
  const updateEducation = async (item: Education) => {
    playClickSound();
    const res = await authFetch('/api/education', { method: 'PUT', body: JSON.stringify(item) });
    if (res.ok) notify('Saved'); else notify('Error');
  };
  const deleteEducation = async (_id: string) => {
    playClickSound();
    const res = await authFetch('/api/education', { method: 'DELETE', body: JSON.stringify({ _id }) });
    if (res.ok) { notify('Deleted'); void loadAll(); }
  };

  const uploadEducationLogo = async (i: number, file: File) => {
    const url = await uploadImage(file);
    if (url) setEducation(prev => prev.map((x, idx) => idx === i ? { ...x, logo_url: url } : x));
  };

  // --- Skills ---
  const [newSkill, setNewSkill] = useState({ category: '', name: '' });
  const addSkill = async () => {
    playClickSound();
    if (!newSkill.category || !newSkill.name) return notify('Category and name required');
    const res = await authFetch('/api/skills', { method: 'POST', body: JSON.stringify(newSkill) });
    if (res.ok) { notify('Skill added'); setNewSkill({ category: '', name: '' }); void loadAll(); }
  };
  const deleteSkill = async (_id: string) => {
    playClickSound();
    const res = await authFetch('/api/skills', { method: 'DELETE', body: JSON.stringify({ _id }) });
    if (res.ok) { notify('Deleted'); void loadAll(); }
  };

  // --- Projects ---
  const addProject = async () => {
    playClickSound();
    const res = await authFetch('/api/projects', { method: 'POST', body: JSON.stringify({ title: 'New Project', description: '', image_url: '', images: [], live_url: '', github_url: '', tags: [], featured: true }) });
    if (res.ok) { notify('Project added'); void loadAll(); }
  };
  const updateProject = async (item: Project) => {
    playClickSound();
    const res = await authFetch('/api/projects', { method: 'PUT', body: JSON.stringify(item) });
    if (res.ok) notify('Saved'); else notify('Error');
  };
  const deleteProject = async (_id: string) => {
    playClickSound();
    const res = await authFetch('/api/projects', { method: 'DELETE', body: JSON.stringify({ _id }) });
    if (res.ok) { notify('Deleted'); void loadAll(); }
  };
  const projectImages = (p: Project) => (p.images && p.images.length ? p.images : p.image_url ? [p.image_url] : []);

  const uploadProjectImages = async (_id: string, files: File[]) => {
    playClickSound();
    try {
      const current = projects.find(p => p._id === _id);
      const existing = projectImages(current ?? ({} as Project));
      const urls: string[] = [];
      for (const file of files) {
        const base64 = await fileToBase64(file);
        const res = await authFetch('/api/upload', { method: 'POST', body: JSON.stringify({ fileName: file.name, fileBase64: base64, contentType: file.type }) });
        const data = await res.json();
        if (!res.ok) { notify(data.error || 'Upload failed'); return; }
        urls.push(data.url);
      }
      const images = [...existing, ...urls];
      setProjects(prev => prev.map(p => p._id === _id ? { ...p, images, image_url: images[0] || '' } : p));
      await authFetch('/api/projects', { method: 'PUT', body: JSON.stringify({ _id, images, image_url: images[0] || '' }) });
      notify(urls.length > 1 ? 'Images uploaded' : 'Image uploaded');
    } catch { notify('Upload failed'); }
  };
  const removeProjectImage = async (_id: string, url: string) => {
    playClickSound();
    const current = projects.find(p => p._id === _id);
    const images = projectImages(current ?? ({} as Project)).filter(u => u !== url);
    setProjects(prev => prev.map(p => p._id === _id ? { ...p, images, image_url: images[0] || '' } : p));
    await authFetch('/api/projects', { method: 'PUT', body: JSON.stringify({ _id, images, image_url: images[0] || '' }) });
    notify('Image removed');
  };
  const moveProjectImage = async (_id: string, from: number, to: number) => {
    playClickSound();
    const current = projects.find(p => p._id === _id);
    const images = [...projectImages(current ?? ({} as Project))];
    if (to < 0 || to >= images.length) return;
    [images[from], images[to]] = [images[to], images[from]];
    setProjects(prev => prev.map(p => p._id === _id ? { ...p, images, image_url: images[0] || '' } : p));
    await authFetch('/api/projects', { method: 'PUT', body: JSON.stringify({ _id, images, image_url: images[0] || '' }) });
    notify('Image order updated');
  };

  const deleteMessage = async (_id: string) => {
    playClickSound();
    const res = await authFetch('/api/messages', { method: 'DELETE', body: JSON.stringify({ _id }) });
    if (res.ok) { notify('Deleted'); void loadAll(); }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen text-[var(--fg)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div>
            <h1 className="font-heading text-lg font-semibold">Admin Dashboard</h1>
            <p className="text-xs text-[var(--fg-muted)]">{token ? 'Authenticated' : 'Guest'}</p>
          </div>
          <button onClick={signOut} className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold transition hover:border-rose-400 hover:text-rose-400">
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-8 flex flex-wrap gap-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { playClickSound(); setTab(t.id); }}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${tab === t.id ? 'bg-[var(--accent)] text-[var(--accent-contrast)]' : 'border border-[var(--border)] text-[var(--fg-muted)] hover:border-[var(--accent)]/50'}`}
            >
              <t.icon size={14} /> {t.label}
              {t.id === 'messages' && messages.some(m => !m.read) && <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />}
            </button>
          ))}
        </div>

        {tab === 'profile' && profile && (
          <form onSubmit={saveProfile} className="max-w-2xl space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--card)]/60 p-7">
            <div className="flex items-center gap-4">
              <img src={profile.avatar_url || '/avatar.png'} alt="avatar" className="h-20 w-20 rounded-2xl object-cover border border-[var(--border)]" />
              <label className="flex cursor-pointer items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold hover:border-[var(--accent)]/60">
                <Upload size={13} /> Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
              </label>
            </div>
            <div className="flex items-center gap-4">
              <img src={profile.logo_url || '/avatar.png'} alt="logo" className="h-16 w-16 rounded-2xl object-cover border border-[var(--border)]" />
              <label className="flex cursor-pointer items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold hover:border-[var(--accent)]/60">
                <Upload size={13} /> Upload Logo
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
              </label>
            </div>
            <Field label="Full Name" value={profile.full_name} onChange={v => setProfile({ ...profile, full_name: v })} />
            <Field label="Title" value={profile.title} onChange={v => setProfile({ ...profile, title: v })} />
            <Field label="Phone" value={profile.phone} onChange={v => setProfile({ ...profile, phone: v })} />
            <Field label="Email" value={profile.email} onChange={v => setProfile({ ...profile, email: v })} />
            <Field label="LinkedIn" value={profile.linkedin} onChange={v => setProfile({ ...profile, linkedin: v })} />
            <Field label="GitHub" value={profile.github} onChange={v => setProfile({ ...profile, github: v })} />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--fg-muted)]">Summary</label>
              <textarea value={profile.summary} onChange={e => setProfile({ ...profile, summary: e.target.value })} rows={5} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)]/60 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" />
            </div>
            <button type="submit" className="flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-contrast)] hover:brightness-110"><Save size={14} /> Save Profile</button>
          </form>
        )}

        {tab === 'bio' && (
          <form onSubmit={saveBio} className="max-w-2xl space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--card)]/60 p-7">
            <Field label="Hero Title" value={bio.hero_title} onChange={v => setBio({ ...bio, hero_title: v })} />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--fg-muted)]">Story Paragraphs (one per line)</label>
              <textarea value={bio.story_paragraphs.join('\n\n')} onChange={e => setBio({ ...bio, story_paragraphs: e.target.value.split('\n\n').map(p => p.trim()).filter(Boolean) })} rows={5} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)]/60 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" />
            </div>
            <Field label="University Section Title" value={bio.university_title} onChange={v => setBio({ ...bio, university_title: v })} />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--fg-muted)]">University Intro</label>
              <textarea value={bio.university_intro || ''} onChange={e => setBio({ ...bio, university_intro: e.target.value })} rows={3} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)]/60 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" />
            </div>
            <div className="flex items-center gap-4">
              <img src={bio.university_image_url || '/avatar.png'} alt="university" className="h-20 w-32 rounded-xl object-cover border border-[var(--border)]" />
              <label className="flex h-fit cursor-pointer items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold hover:border-[var(--accent)]/60">
                <Upload size={13} /> Upload Friends Photo
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadBioImage(e.target.files[0])} />
              </label>
            </div>
            <Field label="University Text (before GitHub links)" value={bio.university_text_before_links} onChange={v => setBio({ ...bio, university_text_before_links: v })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="GitHub Link 1 Title" value={bio.university_links[0]?.title || ''} onChange={v => setBio({ ...bio, university_links: [{ ...(bio.university_links[0] || { title: '', url: '' }), title: v }, bio.university_links[1] || { title: '', url: '' }] })} />
              <Field label="GitHub Link 1 URL" value={bio.university_links[0]?.url || ''} onChange={v => setBio({ ...bio, university_links: [{ ...(bio.university_links[0] || { title: '', url: '' }), url: v }, bio.university_links[1] || { title: '', url: '' }] })} />
              <Field label="GitHub Link 2 Title" value={bio.university_links[1]?.title || ''} onChange={v => setBio({ ...bio, university_links: [bio.university_links[0] || { title: '', url: '' }, { ...(bio.university_links[1] || { title: '', url: '' }), title: v }] })} />
              <Field label="GitHub Link 2 URL" value={bio.university_links[1]?.url || ''} onChange={v => setBio({ ...bio, university_links: [bio.university_links[0] || { title: '', url: '' }, { ...(bio.university_links[1] || { title: '', url: '' }), url: v }] })} />
            </div>
            <Field label="University Text (after GitHub links)" value={bio.university_text_after_links} onChange={v => setBio({ ...bio, university_text_after_links: v })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Career Period" value={bio.career_period} onChange={v => setBio({ ...bio, career_period: v })} />
              <Field label="Career Role" value={bio.career_role} onChange={v => setBio({ ...bio, career_role: v })} />
            </div>
            <Field label="Career Company" value={bio.career_company} onChange={v => setBio({ ...bio, career_company: v })} />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--fg-muted)]">Career Intro</label>
              <textarea value={bio.career_intro || ''} onChange={e => setBio({ ...bio, career_intro: e.target.value })} rows={3} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)]/60 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" />
            </div>
            <div className="flex items-center gap-4">
              <img src={bio.career_image_url || '/avatar.png'} alt="career" className="h-20 w-32 rounded-xl object-cover border border-[var(--border)]" />
              <label className="flex h-fit cursor-pointer items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold hover:border-[var(--accent)]/60">
                <Upload size={13} /> Upload Career Photo
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadCareerImage(e.target.files[0])} />
              </label>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--fg-muted)]">Career Story</label>
              <textarea value={bio.career_body || ''} onChange={e => setBio({ ...bio, career_body: e.target.value })} rows={5} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)]/60 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" />
            </div>
            <Field label="Career Stack (comma separated)" value={bio.career_stack.join(', ')} onChange={v => setBio({ ...bio, career_stack: v.split(',').map(t => t.trim()).filter(Boolean) })} />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--fg-muted)]">Ending</label>
              <textarea value={bio.ending || ''} onChange={e => setBio({ ...bio, ending: e.target.value })} rows={3} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)]/60 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" />
            </div>
            <button type="submit" className="flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-contrast)] hover:brightness-110"><Save size={14} /> Save Bio</button>
          </form>
        )}

        {tab === 'experience' && (
          <div className="space-y-5">
            <button onClick={addExperience} className="flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-contrast)] hover:brightness-110"><Plus size={15} /> Add Experience</button>
            {experience.map((exp, i) => (
              <div key={exp._id} className="rounded-3xl border border-[var(--border)] bg-[var(--card)]/60 p-6 space-y-3">
                <div className="flex items-center gap-4">
                  <img src={exp.logo_url || '/avatar.png'} alt="company logo" className="h-14 w-14 rounded-xl object-cover border border-[var(--border)]" />
                  <label className="flex h-fit cursor-pointer items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold hover:border-[var(--accent)]/60">
                    <Upload size={13} /> Upload Logo
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadExperienceLogo(i, e.target.files[0])} />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Company" value={exp.company} onChange={v => setExperience(prev => prev.map((x, idx) => idx === i ? { ...x, company: v } : x))} />
                  <Field label="Role" value={exp.role} onChange={v => setExperience(prev => prev.map((x, idx) => idx === i ? { ...x, role: v } : x))} />
                </div>
                <Field label="Period" value={exp.period} onChange={v => setExperience(prev => prev.map((x, idx) => idx === i ? { ...x, period: v } : x))} />
                <Field label="Company Link" value={exp.link || ''} onChange={v => setExperience(prev => prev.map((x, idx) => idx === i ? { ...x, link: v } : x))} />
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--fg-muted)]">Points (one per line)</label>
                  <textarea value={exp.points.join('\n')} onChange={e => setExperience(prev => prev.map((x, idx) => idx === i ? { ...x, points: e.target.value.split('\n') } : x))} rows={4} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)]/60 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateExperience(exp)} className="flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent-contrast)] hover:brightness-110"><Save size={12} /> Save</button>
                  <button onClick={() => deleteExperience(exp._id)} className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold text-rose-400 hover:border-rose-400"><Trash2 size={12} /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'education' && (
          <div className="space-y-5">
            <button onClick={addEducation} className="flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-contrast)] hover:brightness-110"><Plus size={15} /> Add Education</button>
            {education.map((edu, i) => (
              <div key={edu._id} className="rounded-3xl border border-[var(--border)] bg-[var(--card)]/60 p-6 space-y-3">
                <div className="flex items-center gap-4">
                  <img src={edu.logo_url || '/avatar.png'} alt="institution logo" className="h-14 w-14 rounded-xl object-cover border border-[var(--border)]" />
                  <label className="flex h-fit cursor-pointer items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold hover:border-[var(--accent)]/60">
                    <Upload size={13} /> Upload Logo
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadEducationLogo(i, e.target.files[0])} />
                  </label>
                </div>
                <Field label="Institution" value={edu.institution} onChange={v => setEducation(prev => prev.map((x, idx) => idx === i ? { ...x, institution: v } : x))} />
                <Field label="Degree" value={edu.degree} onChange={v => setEducation(prev => prev.map((x, idx) => idx === i ? { ...x, degree: v } : x))} />
                <Field label="Period" value={edu.period} onChange={v => setEducation(prev => prev.map((x, idx) => idx === i ? { ...x, period: v } : x))} />
                <Field label="Institution Link" value={edu.link || ''} onChange={v => setEducation(prev => prev.map((x, idx) => idx === i ? { ...x, link: v } : x))} />
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--fg-muted)]">Description</label>
                  <textarea value={edu.description || ''} onChange={e => setEducation(prev => prev.map((x, idx) => idx === i ? { ...x, description: e.target.value } : x))} rows={3} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)]/60 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateEducation(edu)} className="flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent-contrast)] hover:brightness-110"><Save size={12} /> Save</button>
                  <button onClick={() => deleteEducation(edu._id)} className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold text-rose-400 hover:border-rose-400"><Trash2 size={12} /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'skills' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 rounded-3xl border border-[var(--border)] bg-[var(--card)]/60 p-5">
              <input placeholder="Category" value={newSkill.category} onChange={e => setNewSkill({ ...newSkill, category: e.target.value })} className="flex-1 min-w-[140px] rounded-xl border border-[var(--border)] bg-[var(--bg)]/60 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" />
              <input placeholder="Skill name" value={newSkill.name} onChange={e => setNewSkill({ ...newSkill, name: e.target.value })} className="flex-1 min-w-[140px] rounded-xl border border-[var(--border)] bg-[var(--bg)]/60 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" />
              <button onClick={addSkill} className="flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent-contrast)] hover:brightness-110"><Plus size={13} /> Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map(s => (
                <span key={s._id} className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)]/60 px-3 py-1.5 text-xs">
                  <span className="text-[var(--fg-muted)]">{s.category}:</span> {s.name}
                  <button onClick={() => deleteSkill(s._id)}><Trash2 size={11} className="text-rose-400" /></button>
                </span>
              ))}
            </div>
          </div>
        )}

        {tab === 'projects' && (
          <div className="space-y-5">
            <button onClick={addProject} className="flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-contrast)] hover:brightness-110"><Plus size={15} /> Add Project</button>
            {projects.map((p, i) => {
              const images = projectImages(p);
              return (
                <div key={p._id} className="rounded-3xl border border-[var(--border)] bg-[var(--card)]/60 p-6 space-y-3">
                  <div className="flex flex-wrap items-start gap-4">
                    {images.map((url: string, idx: number) => (
                      <div key={url} className="relative">
                        <img src={url} alt="" className="h-20 w-28 rounded-xl object-cover border border-[var(--border)]" />
                        <button onClick={() => removeProjectImage(p._id, url)} title="Remove image" className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white shadow hover:bg-rose-400">
                          <Trash2 size={11} />
                        </button>
                        {images.length > 1 && (
                          <div className="mt-1.5 flex items-center justify-center gap-1.5">
                            <button onClick={() => moveProjectImage(p._id, idx, idx - 1)} disabled={idx === 0} title="Move earlier" className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] text-[var(--fg-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-30">
                              <ChevronLeft size={12} />
                            </button>
                            <button onClick={() => moveProjectImage(p._id, idx, idx + 1)} disabled={idx === images.length - 1} title="Move later" className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] text-[var(--fg-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-30">
                              <ChevronRight size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    <label className="flex h-fit cursor-pointer items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold hover:border-[var(--accent)]/60">
                      <Upload size={13} /> Upload Images
                      <input type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files && e.target.files.length > 0 && uploadProjectImages(p._id, Array.from(e.target.files))} />
                    </label>
                  </div>
                  <Field label="Title" value={p.title} onChange={v => setProjects(prev => prev.map((x, idx) => idx === i ? { ...x, title: v } : x))} />
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[var(--fg-muted)]">Description</label>
                    <textarea value={p.description || ''} onChange={e => setProjects(prev => prev.map((x, idx) => idx === i ? { ...x, description: e.target.value } : x))} rows={3} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)]/60 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="relative">
                      <ExternalLink size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]" />
                      <input placeholder="Live URL" value={p.live_url || ''} onChange={e => setProjects(prev => prev.map((x, idx) => idx === i ? { ...x, live_url: e.target.value } : x))} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)]/60 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--accent)]" />
                    </div>
                    <div className="relative">
                      <Github size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]" />
                      <input placeholder="GitHub URL" value={p.github_url || ''} onChange={e => setProjects(prev => prev.map((x, idx) => idx === i ? { ...x, github_url: e.target.value } : x))} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)]/60 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--accent)]" />
                    </div>
                  </div>
                  <Field label="Tags (comma separated)" value={p.tags.join(', ')} onChange={v => setProjects(prev => prev.map((x, idx) => idx === i ? { ...x, tags: v.split(',').map(t => t.trim()).filter(Boolean) } : x))} />
                  <div className="flex gap-2">
                    <button onClick={() => updateProject(p)} className="flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent-contrast)] hover:brightness-110"><Save size={12} /> Save</button>
                    <button onClick={() => deleteProject(p._id)} className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold text-rose-400 hover:border-rose-400"><Trash2 size={12} /> Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'messages' && (
          <div className="space-y-4">
            {messages.length === 0 && <p className="text-sm text-[var(--fg-muted)]">No messages yet.</p>}
            {messages.map(m => (
              <div key={m._id} className="rounded-3xl border border-[var(--border)] bg-[var(--card)]/60 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{m.name} <span className="text-[var(--fg-muted)] font-normal">&lt;{m.email}&gt;</span></p>
                    <p className="text-xs text-[var(--fg-muted)]">{new Date(m.created_at).toLocaleString()}</p>
                  </div>
                  <button onClick={() => deleteMessage(m._id)}><Trash2 size={14} className="text-rose-400" /></button>
                </div>
                <p className="mt-3 text-sm leading-relaxed">{m.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-[var(--fg)] px-5 py-2.5 text-xs font-semibold text-[var(--bg)] shadow-xl">
          {toast}
        </motion.div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[var(--fg-muted)]">{label}</label>
      <input value={value || ''} onChange={e => onChange(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)]/60 px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]" />
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
