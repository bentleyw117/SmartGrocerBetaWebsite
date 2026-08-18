# Smart Grocer beta site

Public waitlist for the Smart Grocer beta. Conversion goal: collect testers.

Canonical URL (once you attach the domain): https://beta.smartgrocerapp.com

You can keep editing after it is live. Production is just this GitHub repo on Cloudflare Pages. A change on `main` (or a merged pull request) rebuilds the site. Preview URLs on pull requests let you look before merging.

Do not change Resend MX / SPF / DKIM on `smartgrocerapp.com`. A `beta` CNAME is the only DNS this site needs.

## How to look at it

Until Pages is connected, there is no public URL yet. After you connect the repo (steps below), Cloudflare gives you:

- A preview URL like `https://smart-grocer-beta.pages.dev` (safe to share, not the custom domain)
- Later: `https://beta.smartgrocerapp.com`

On your laptop:

```bash
cp .env.example .env
# paste the three keys into .env
npm install
npm run pages:dev
```

Open the localhost URL Wrangler prints (usually `http://127.0.0.1:8787`).

## What “Pages secrets” are

They are **not** a special Smart Grocer setting. They are three values Cloudflare injects into the waitlist function so keys never go in the website JavaScript.

| Name | What it is |
| --- | --- |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon / publishable key |
| `RESEND_API_KEY` | Resend API key for “you're on the list” email |

**On your computer:** a gitignored file named `.env` (copy from `.env.example`). Same names, one per line.

**On Cloudflare (production):**

1. Open [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
2. Click the Pages project (`smart-grocer-beta` once created)
3. **Settings** → **Variables and Secrets** (sometimes labeled **Environment variables**)
4. **Add**, name exactly as above, paste the value, choose **Secret** / **Encrypt**
5. Add all three for **Production** and again for **Preview** if Cloudflare shows both

Until those three are set on Pages, the site still loads; **Request access** returns an error because the waitlist function refuses to run without them.

## Ship to production (still editable)

One-time, in the same Cloudflare account that already hosts `smartgrocerapp.com`:

1. [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages) → **Create** → **Pages** → **Connect to Git** → this repo (`SmartGrocerBetaWebsite`)
2. Production branch: `main` (merge [PR #1](https://github.com/bentleyw117/SmartGrocerBetaWebsite/pull/1) first, or temporarily use `cursor/smart-grocer-marketing-site-ac7d`)
3. Build command: `npm run build`
4. Build output directory: `dist`
5. Root directory: `/`
6. Add the three secrets above
7. **Custom domains** → add `beta.smartgrocerapp.com` only  
   Cloudflare will create a `beta` CNAME. Do not add www. Do not add the apex. Do not edit MX / SPF / DKIM.

After that, editing is: change the code → open a PR → merge to `main` → Pages rebuilds. No redeploy ritual.

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
npm run pages:dev
```
