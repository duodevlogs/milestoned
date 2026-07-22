# Milestoned

AI-generated Scope of Work, Contract, Proposal, and Invoice documents for
freelance web developers and small dev consultancies — with milestone-based,
interest-free payment terms built into every document.

## Stack

Next.js (App Router) · Vercel · Supabase (Postgres + Auth) · Drizzle ORM ·
Tailwind CSS v4 · Zustand · TanStack Query · Zod · Stripe ·
OpenAI API (gpt-5.4-nano) · @react-pdf/renderer · Resend

## Architecture

Layered backend — request flow is always:

```
HTTP layer  →  controller  →  service  →  repository  →  database
```

| Layer | Location | Responsibility |
| --- | --- | --- |
| HTTP | `app/api/**/route.ts`, server actions (`app/**/actions.ts`) | Parse the request, call one controller method, return/redirect. **No business logic.** |
| Controllers | `server/controllers/` | Validate raw input with Zod, handle auth/session checks, call services, shape the response. No DB or external-API calls. |
| Services | `server/services/` | All business logic: credit checks, rate limiting, the AI generation API, Stripe, orchestration. Never touch the DB directly. |
| Repositories | `server/repositories/` | The only layer that queries the database, via Drizzle. One repository per table. |
| DB | `server/db/` | Drizzle client + schema (mirrors `supabase/migrations/`). |

**Where new code goes:** new business logic goes in `services/`, never in
route handlers. New tables get a SQL migration in `supabase/migrations/`
(source of truth) plus a mirrored Drizzle definition in `server/db/schema.ts`
and a repository. New endpoints are a thin `route.ts` + a controller method.

Other conventions:

- **Validation** — every external input (forms, webhook payloads, query
  params) is parsed with a Zod schema from `server/validation/` before it
  reaches a service.
- **Errors** — throw `AppError` (`server/errors.ts`) with a user-safe
  message. API routes return `{ error: { code, message } }` with proper
  status codes via `jsonError()`; unexpected errors are logged server-side
  and surfaced as a generic 500 — internal details never reach the client.
- **Server components** may call services directly (they are already
  server-side); controllers exist for HTTP entry points.
- **Auth** stays on Supabase (`lib/supabase/`, `proxy.ts` for session
  refresh + route guarding). Drizzle replaces raw table queries only.
  The Drizzle connection bypasses RLS, which is why it is confined to
  repositories and services must only pass ids from verified sessions.
- **Client state** — Zustand (`lib/stores/`) for UI state, TanStack Query
  (provider in `app/providers.tsx`) for caching server data the user is
  authorized to see. No secret, API key, or confidential value is ever
  placed in client-visible state.
- **Styling** — Tailwind v4 with the design tokens defined as a theme
  extension in `app/globals.css` (`@theme` — v4's CSS-first replacement for
  `tailwind.config`). Use token utilities (`bg-navy`, `text-gold`,
  `border-line-soft`, `font-display`); arbitrary values only where the
  designs require exact pixels outside Tailwind's scale.

## Setup

1. **Env vars** — copy `.env.example` to `.env.local` and fill in values.
   `.env*` is gitignored; server-only secrets (`SUPABASE_SECRET_KEY`,
   `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
   `OPENAI_API_KEY`, `RESEND_API_KEY`) are read only via `process.env` in
   server code. Supabase's client-safe key is `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   (the current `sb_publishable_...` key — Supabase is retiring the legacy
   `anon` JWT by end of 2026).

2. **Supabase** — create a project at supabase.com, then run
   `supabase/migrations/0001_init.sql` in the SQL editor. This creates
   `founding_members`, `users`, and `documents` with row-level security,
   plus a trigger that provisions a `users` row on signup (founding members
   with a paid row get 20 credits and `is_founding_member = true`
   automatically). Grab the **transaction pooler** connection string for
   `DATABASE_URL`.

3. **Auth settings** — in Supabase → Authentication → URL Configuration,
   set the site URL and add `http://localhost:3000/auth/callback` (and your
   production `/auth/callback`) to the redirect allow-list.

4. `npm run dev`

## Security invariants

- OpenAI + Stripe secret keys never appear in client code — server routes only.
- Stripe webhooks verify signatures with `STRIPE_WEBHOOK_SECRET` before processing.
- Generation route checks auth + credits + rate limit **before** calling the AI API.
- `founding_members` is written only by the webhook (service role); RLS denies
  all client access.
- No secrets in Zustand, TanStack Query cache, or any client-visible state.
