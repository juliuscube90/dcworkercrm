# DCworker CRM

Contacts and pipeline for agency teams — built on Next.js (App Router) and Supabase.

## Stack

- **Next.js 16** (App Router, Server Actions, Turbopack)
- **Supabase** — Postgres, Auth, and Row Level Security
- **Tailwind CSS v4**

## Data model

Multi-tenant by `agency`:

- `agencies` — one row per workspace
- `profiles` — one row per team member, linked to `auth.users`, with a role (`owner` / `admin` / `staff` / `client`)
- `clients` — the agency's contacts/accounts (shown in the UI as **Contacts**)
- `opportunities` — deals tied to a client, tracked through a **Pipeline** of stages
- `tasks`, `client_assignments` — present in the schema, not yet wired into the UI

Signing up creates a new agency automatically (via a Postgres trigger on `auth.users`) and makes the signer its `owner`. Row Level Security scopes every table to the caller's agency; `owner`/`admin`/`staff` can manage Contacts and Pipeline, while deletes are restricted to `owner`/`admin`.

## Local development

```bash
npm install
npm run dev
```

Requires a `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Both values are safe to expose client-side — Supabase's anon/publishable key relies on RLS, not secrecy.

## Deployment

Deployed directly to Vercel. If you connect this to a GitHub repo for git-based deploys, add the two env vars above under Project Settings → Environment Variables (a checked-in `.env.production` is used for direct/CLI deploys, but Vercel's dashboard env vars take precedence once git-connected).
