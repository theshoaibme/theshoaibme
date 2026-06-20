# Resume download pipeline

The `/resume` page generates a 2-page PDF in the browser and optionally records the download on the server (counter + Telegram notification).

**Routes:** `/resume` and `/cv` (redirects to `/resume`)

---

## How it works

```
User clicks "Download Resume"
  → Cloudflare Turnstile (invisible, production only)
  → PDF generated client-side (html2canvas + jsPDF)
  → POST /resume-download on the contact Worker
      → Security checks + Turnstile verify
      → KV counter updated
      → Telegram notification sent
```

The PDF is **never uploaded** to a server. Tracking is **fire-and-forget** — if it fails, the PDF still downloads.

---

## Where data is stored

| Data | Location | Notes |
|------|----------|--------|
| Resume text & layout | `src/config/resumeContent.ts` | Static content in the repo |
| Page title / nav / footer | `data/portfolio.json` → encrypted to `public/data.enc` | Network shows binary only |
| Generated PDF | User's browser only | Not stored on GitHub or Cloudflare |
| Download counts | **Cloudflare KV** (`DOWNLOAD_STATS`) | See keys below |
| Rate limits (3/min) | **Cloudflare Cache** | Temporary, ~60s TTL |
| Notifications | **Telegram chat** | Message history in your bot chat |
| Secrets | **Cloudflare Worker secrets** | Not in git |

### KV keys (`DOWNLOAD_STATS`)

| Key | Purpose |
|-----|---------|
| `total` | All-time tracked download count |
| `daily:YYYY-MM-DD` | Downloads on that UTC date |
| `last_download_at` | ISO timestamp of last tracked download |
| `ip:{hash}:daily:YYYY-MM-DD` | Per-visitor daily cap (max 5); IP is hashed, not stored raw |
| `turnstile:{hash}` | Used Turnstile tokens (~10 min TTL, replay protection) |

KV namespace ID (production): `f9ce9ac547764f7580cf49b088f2796d`  
Binding: `DOWNLOAD_STATS` on Worker `portfolio-contact-api`

### View KV from CLI

```bash
cd workers/contact-api
npx wrangler kv key get --binding DOWNLOAD_STATS total
npx wrangler kv key list --binding DOWNLOAD_STATS
```

Or: **Cloudflare Dashboard** → Workers & Pages → KV → `DOWNLOAD_STATS`.

---

## Security

| Layer | Detail |
|-------|--------|
| Turnstile | Required for tracking; token verified server-side |
| Token replay | Same Turnstile token cannot be used twice |
| CORS + Origin | Only allowed site origins |
| Sec-Fetch | Blocks typical cross-site browser requests |
| Rate limit | 3 tracking requests / minute / IP |
| Daily cap | 5 tracked downloads / day / hashed IP |
| Honeypot | Hidden field; bots get silent no-op |
| Privacy | Raw IP never sent to Telegram; only a short hash prefix |

The **resume PDF itself is public** — anyone can view `/resume` and save a PDF. Security applies to **tracking and Telegram**, not hiding the CV.

### Worker secrets (not in repo)

```bash
cd workers/contact-api
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID
```

### Frontend env (build / `.env`)

- `VITE_TURNSTILE_SITE_KEY` — Turnstile site key (same widget as contact form)
- `VITE_CONTACT_API_URL` — Worker base URL; tracking uses `{url}/resume-download`

Dev proxy: `/api/resume-download` → Worker `/resume-download` (see `vite.config.ts`).

---

## Key files

| File | Role |
|------|------|
| `src/pages/ResumePage.tsx` | UI, Turnstile, download button |
| `src/utils/resumeDownloadPipeline.ts` | PDF then tracking |
| `src/utils/downloadResumePdf.ts` | Client PDF generation |
| `src/utils/resumeDownloadApi.ts` | POST to Worker |
| `src/config/download.ts` | API URL helper |
| `workers/contact-api/src/resumeDownload.ts` | Server handler |
| `workers/contact-api/src/requestSecurity.ts` | Origin / Sec-Fetch checks |
| `workers/contact-api/wrangler.toml` | KV binding + allowed origins |

---

## Deploy

Worker (KV + `/resume-download` route):

```bash
cd workers/contact-api && npx wrangler deploy
```

Site (GitHub Pages): push to `main` — workflow runs `pnpm build` and deploys.

---

## Local dev notes

- Without a **real** Turnstile site key, PDF download works but **tracking is skipped**.
- Turnstile may log harmless console messages (`about:blank` sandbox) — expected Cloudflare behavior.
- Contact form and resume tracking share the same Worker and Turnstile widget.
