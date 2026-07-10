# Anuk Hettiarachchi — Portfolio

A full-stack developer portfolio inspired by Apple's **Human Interface Guidelines** (Clarity, Deference, Depth). Built with Vite + React + TypeScript on the frontend, Vercel serverless functions (Node.js/Express-style handlers) on the backend, and **Supabase (PostgreSQL)** as the persistent database with Supabase Auth + Storage.

> Note: the brief asked for MongoDB, but this environment provisions a managed **Supabase Postgres** database (accessed only via the Supabase JS client — no raw SQL, no direct `pg`/Mongo driver). The schema below is modeled exactly the way a MongoDB collection design would look (one "collection"/table per resource, JSON arrays for nested lists), so it maps 1:1 onto MongoDB collections if you ever migrate.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, React Router, lucide-react
- **Backend:** Vercel Serverless Functions (`/api/*.js`) — Node.js/Express-style request handlers with CORS, validation, and auth checks
- **Database:** Supabase PostgreSQL (via `@supabase/supabase-js`, never raw SQL)
- **Auth:** Supabase Auth (email/password) protecting the `/admin` dashboard
- **Storage:** Supabase Storage bucket `portfolio-media` for project images & avatar uploads

## Database Structure (Supabase / Postgres)

### `profile`
Single-row table holding the hero/about content.

| Column | Type | Notes |
|---|---|---|
| id | serial (PK) | |
| full_name | text | |
| title | text | e.g. "Full Stack Developer \| React \| Java \| Spring Boot" |
| phone | text | |
| email | text | |
| linkedin | text | |
| github | text | |
| summary | text | professional summary |
| avatar_url | text | Supabase Storage public URL |
| location | text | |
| updated_at | timestamptz | default now() |

### `experience`
Work history, rendered with icons on the timeline.

| Column | Type | Notes |
|---|---|---|
| id | serial (PK) | |
| company | text | |
| role | text | |
| period | text | e.g. "Jul 2024 – Mar 2026" |
| points | jsonb | array of bullet strings |
| icon | text | lucide-react icon name, e.g. `Briefcase` |
| order_index | integer | display order |
| created_at | timestamptz | |

### `education`
Academic background, rendered with icons.

| Column | Type | Notes |
|---|---|---|
| id | serial (PK) | |
| institution | text | |
| degree | text | |
| period | text | |
| description | text | |
| icon | text | lucide-react icon name, e.g. `GraduationCap` |
| order_index | integer | |
| created_at | timestamptz | |

### `skills`
Grouped technical skills.

| Column | Type | Notes |
|---|---|---|
| id | serial (PK) | |
| category | text | e.g. Frontend, Backend, Testing & QA, Tools & Platforms, Methodologies |
| name | text | e.g. React, Java, Spring Boot |
| order_index | integer | |
| created_at | timestamptz | |

### `projects`
Portfolio project cards with image upload + live/GitHub links.

| Column | Type | Notes |
|---|---|---|
| id | serial (PK) | |
| title | text | |
| description | text | |
| image_url | text | Supabase Storage public URL |
| live_url | text | optional live demo link |
| github_url | text | optional GitHub repo link |
| tags | jsonb | array of tag strings |
| featured | boolean | |
| order_index | integer | |
| created_at | timestamptz | |

### `technologies`
Powers the horizontal auto-scrolling tech marquee.

| Column | Type | Notes |
|---|---|---|
| id | serial (PK) | |
| name | text | e.g. "Next.js" |
| slug | text | simple-icons slug used for the logo, e.g. `nextdotjs` |
| order_index | integer | |

### `messages`
Contact form submissions (visible only in the authenticated Admin dashboard).

| Column | Type | Notes |
|---|---|---|
| id | serial (PK) | |
| name | text | |
| email | text | |
| message | text | |
| read | boolean | default false |
| created_at | timestamptz | |

## Storage

- **Bucket:** `portfolio-media` (public) — stores uploaded avatar & project images. Files are uploaded via `POST /api/upload` (auth required, validates MIME type & 5MB size limit) and referenced by their public URL in `profile.avatar_url` / `projects.image_url`.

## Auth & Admin

- Supabase email/password auth protects `/admin`.
- Demo credentials: `demo@example.com` / `password123`
- From `/admin` you can edit the profile, add/edit/delete experience, education, skills and projects, upload images, and review/delete contact messages — all changes are written straight to the Supabase tables above and reflected live on the public site.

## API Routes (`/api`)

| Route | Methods | Auth |
|---|---|---|
| `/api/profile` | GET, PUT | PUT requires auth |
| `/api/experience` | GET, POST, PUT, DELETE | mutations require auth |
| `/api/education` | GET, POST, PUT, DELETE | mutations require auth |
| `/api/skills` | GET, POST, DELETE | mutations require auth |
| `/api/projects` | GET, POST, PUT, DELETE | mutations require auth |
| `/api/technologies` | GET | public |
| `/api/messages` | GET, POST, PUT, DELETE | POST public (contact form), rest require auth |
| `/api/upload` | POST | requires auth |

All routes are implemented as Vercel serverless functions using the Supabase JS client (service role on the server), with CORS headers, input validation, and 401/400/500 error handling.
 mongodb+srv://anuksindeepas_db_user:pxi3dqeFDKjg4BR4@cluster0.4zzauiz.mongodb.net/?appName=Cluster0

 Demo: demo@example.com / password123