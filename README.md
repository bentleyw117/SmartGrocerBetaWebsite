# Smart Grocer beta site

Public waitlist for the Smart Grocer beta. Conversion goal: collect testers. Canonical URL: https://beta.smartgrocerapp.com

Do not attach a custom domain, point DNS, or change Resend MX / SPF / DKIM until a human confirms.

## Local

```bash
cp .env.example .env
# Fill SUPABASE_URL, SUPABASE_ANON_KEY, and RESEND_API_KEY
npm install
```

The waitlist API is a Cloudflare Pages Function. It **fails fast** if those three variables are missing.

```bash
# Visual-only (Vite). The form posts to /api/waitlist, which this server does not provide.
npm run dev

# Full site + waitlist function (recommended)
npm run pages:dev
```

`npm run pages:dev` builds into `dist/` and serves it with Wrangler. Open the printed localhost URL.

Wrangler reads `.env` / `.dev.vars` for local secrets. Do not commit either file.

```bash
npm run typecheck
npm run build
```

## Waitlist

Signups insert into Supabase table `beta_waitlist` (email unique). Repeat emails still see “You're on the list.” Public/anon is insert-only — no public SELECT.

After a first-time insert, a confirmation email is sent via Resend from `Smart Grocer <hello@smartgrocerapp.com>`. No operator notify email.

SQL for the table lives in `supabase/migrations/20260817210000_create_beta_waitlist.sql` and has been applied on the existing Smart Grocer project.

## Drop-in media

Leave these paths empty until real files exist. The layout already reserves space.

### Brand

| Path | Use | Notes |
| --- | --- | --- |
| `public/brand/logo.svg` | Nav, hero, footer well | Preferred. Square or wide; `object-fit: contain` in a 1:1 well (`2.75rem` nav / `3.5rem` hero). |
| `public/brand/logo.png` | Fallback if SVG is missing | Same well. |
| `public/brand/favicon.png` | Favicon | Replace the typeset wordmark when a real icon exists. |
| `public/brand/og.png` | Open Graph | 1200 × 630. |

Empty logo wells omit the glyph and keep the box so a later mark does not reflow the header.

### Product preview

| Path | Caption / role | Recommended size |
| --- | --- | --- |
| `public/preview/phone-1.png` | List | 1170 × 2532 (9:19.5), PNG |
| `public/preview/phone-2.png` | Optimize | 1170 × 2532 (9:19.5), PNG |
| `public/preview/phone-3.png` | Shop | 1170 × 2532 (9:19.5), PNG |
| `public/preview/poster.jpg` | Video poster (required when video ships) | 1920 × 1080, JPG |
| `public/preview/demo.mp4` | Muted product film | 1920 × 1080, H.264, muted |

When a file is present it appears; when it is missing the designed empty state stays. No layout rewrite.

## Deploy to Cloudflare Pages

Ask before production deploy or DNS.

1. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect this GitHub repo (or Direct Upload).
2. Build command: `npm run build`
3. Build output directory: `dist`
4. Root directory: `/` (this repo is the site)
5. Compatibility date: `2026-08-17` (also in `wrangler.jsonc`)
6. Add **encrypted** environment variables / secrets (production and preview):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `RESEND_API_KEY`
7. Project name in `wrangler.jsonc`: `smart-grocer-beta`
8. Custom domain **only after confirmation**: `beta.smartgrocerapp.com` on the existing `smartgrocerapp.com` zone. No www. No apex redirect.

Direct upload without Git:

```bash
npm run build
npx wrangler pages deploy dist --project-name=smart-grocer-beta
```

Set secrets (do not put them in `wrangler.jsonc`):

```bash
npx wrangler pages secret put SUPABASE_URL --project-name=smart-grocer-beta
npx wrangler pages secret put SUPABASE_ANON_KEY --project-name=smart-grocer-beta
npx wrangler pages secret put RESEND_API_KEY --project-name=smart-grocer-beta
```

Privacy draft: `/privacy.html` (also rewritten from `/privacy`). Approve copy before treating it as final.
