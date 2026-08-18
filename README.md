# Smart Grocer beta site

Public waitlist for the Smart Grocer beta. Conversion goal: collect testers.

Canonical URL (once you attach the domain): https://beta.smartgrocerapp.com

You can keep editing after it is live. This GitHub repo deploys with **Workers Builds**. A merge to `main` rebuilds production. Other branches can get preview URLs.

Do not change Resend MX / SPF / DKIM on `smartgrocerapp.com`. A `beta` CNAME is the only DNS this site needs.

## How to look at it

After the first successful Workers Builds deploy:

- `https://smart-grocer-beta.<your-subdomain>.workers.dev`
- Later: `https://beta.smartgrocerapp.com`

On your laptop:

```bash
cp .env.example .env
# paste the three keys into .env
npm install
npm run preview
```

Open the localhost URL Wrangler prints (usually `http://127.0.0.1:8787`).

## Secrets (waitlist keys)

Three values the waitlist uses. They never go in the public JavaScript.

| Name | What it is |
| --- | --- |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon / publishable key |
| `RESEND_API_KEY` | Resend API key for “you're on the list” email |

**Laptop:** gitignored `.env` (copy `.env.example`).

**Cloudflare runtime:** Workers & Pages → `smart-grocer-beta` → **Settings** → **Variables and Secrets**. Add all three, encrypted, for Production and Preview.

Until those exist, the page still loads; **Request access** fails.

The token Workers Builds uses to *upload* the Worker is separate. It is **not** under Manage Account → API Tokens. Look at:

- [My Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
- or the Worker → **Settings** → **Builds** → API token dropdown

You do not need to paste that token into the repo. Leave **Create new token** as-is. That auto token can deploy **Workers**, not Pages — so this project uses `npx wrangler deploy`, not `wrangler pages deploy`.

## Cloudflare build settings

In the Worker **Settings → Builds** (or the create form):

| Field | Value |
| --- | --- |
| Project / Worker name | `smart-grocer-beta` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Non-production deploy command | `npx wrangler versions upload` |
| Path | `/` |
| API token | Create new token |
| API token name | `smart-grocer-beta-builds` |
| Build variables | leave empty |

Custom domain: add **only** `beta.smartgrocerapp.com`. Do not add www or the apex. Do not edit MX / SPF / DKIM.

## Waitlist

Signups insert into Supabase table `beta_waitlist` (email unique). Repeat emails still see “You're on the list.” Public/anon is insert-only — no public SELECT.

After a first-time insert, a confirmation email is sent via Resend from `Smart Grocer <hello@smartgrocerapp.com>`. No operator notify email.

SQL: `supabase/migrations/20260817210000_create_beta_waitlist.sql` (already applied).

## Brand files

| Path | Use |
| --- | --- |
| `public/brand/logo.svg` | Nav, hero, footer well (preferred) |
| `public/brand/logo.png` | Fallback |
| `public/brand/favicon.png` | Tab icon |
| `public/brand/og.png` | Link previews, 1200 × 630 |

## Product preview (drop in later)

| Path | Caption / role | Recommended size |
| --- | --- | --- |
| `public/preview/phone-1.png` | List | 1170 × 2532 (9:19.5) |
| `public/preview/phone-2.png` | Optimize | 1170 × 2532 (9:19.5) |
| `public/preview/phone-3.png` | Shop | 1170 × 2532 (9:19.5) |
| `public/preview/poster.jpg` | Video poster | 1920 × 1080 |
| `public/preview/demo.mp4` | Muted product film | 1920 × 1080, H.264, muted |

Missing files keep the designed empty state.

## Local commands

```bash
npm run typecheck
npm run build
npm run preview
```
