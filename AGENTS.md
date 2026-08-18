# AGENTS.md

## Cursor Cloud specific instructions

Smart Grocer beta is a small static waitlist site (Vite builds `index.html` + `privacy.html`) served by a single Cloudflare Worker (`worker.ts`). The Worker serves the built assets from `dist/` and handles one API route, `POST /api/waitlist` (`functions/api/waitlist.ts`), which inserts into Supabase (`beta_waitlist` table) and sends a confirmation email via Resend. There is one deployable service; there is no separate backend.

### Commands (see `package.json` scripts)
- Typecheck (this repo's "lint"; there is no ESLint): `npm run typecheck` (runs `tsc` for `src/` and `functions/`).
- Build: `npm run build` (`tsc --noEmit && vite build` → outputs `dist/`).
- Run the full app (assets + `/api/waitlist` Worker): `npm run preview` (builds then runs `wrangler dev`, served on `http://localhost:8787`). There is no automated test suite.
- `npm run dev` (plain Vite) serves the static pages only and does NOT run the Worker/API — use `npm run preview` when you need `/api/waitlist`.

### Runtime secrets / gotchas
- The Worker needs `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `RESEND_API_KEY`. Locally, `wrangler dev` reads them from a gitignored `.dev.vars` file (same keys as `.env.example`). Without them the page still loads but `POST /api/waitlist` returns HTTP 500 ("Waitlist is temporarily unavailable.").
- The confirmation email send is best-effort: if Resend fails (e.g. an invalid/placeholder key) the error is caught and the signup still returns `{"ok":true}`. So a successful "You're on the list." only requires a working Supabase insert path.
- `wrangler dev` requires an existing `dist/` build; `npm run preview` builds first. Editing `src/` after starting requires a rebuild for the Worker to serve new assets.
- `functions/lib/rate-limit.ts` allows 5 signups per client IP per 10 minutes; repeated local testing from one IP can return HTTP 429.
