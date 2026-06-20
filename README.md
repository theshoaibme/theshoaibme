# MD Shoaib Khan — Portfolio

Personal portfolio website showcasing my work, skills, services, and contact details.

**Live site:** [theshoaib.me](https://theshoaib.me) · [the-shoaib2.github.io](https://the-shoaib2.github.io)

Both URLs serve the same portfolio. The contact form works on either domain.

[![Homepage preview](https://s0.wp.com/mshots/v1/https://theshoaib.me/#hero)](https://theshoaib.me/#hero)

---

## Edit your content

Most of the site text, projects, skills, and contact info live in one file:

**`data/portfolio.json`**

Open that file, update what you need, save, and restart dev (or run `pnpm encrypt:data`).  
The site loads **`public/data.enc`** (encrypted) — not plain JSON over the network.

Generate a decryption key once:

```bash
openssl rand -base64 32
```

Add it to `.env` as `VITE_DATA_ENCRYPTION_KEY` (see `.env.example`).

---

## Run locally

You need [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) installed.

```bash
pnpm install
pnpm dev
```

Then open **http://localhost:5173** in your browser.

Copy `.env.example` to `.env` and set `VITE_TURNSTILE_SITE_KEY`, `VITE_CONTACT_API_URL`, and `VITE_DATA_ENCRYPTION_KEY`.

---

## Publish changes

Push to the **`main`** branch. GitHub Actions builds and deploys to GitHub Pages automatically.

---

## Custom domain (Namecheap → GitHub Pages)

Domain: **theshoaib.me**

### 1. Namecheap DNS

In [Namecheap](https://www.namecheap.com) → **Domain List** → **Manage** → **Advanced DNS**:

| Type | Host | Value |
|------|------|--------|
| **A** | `@` | `185.199.108.153` |
| **A** | `@` | `185.199.109.153` |
| **A** | `@` | `185.199.110.153` |
| **A** | `@` | `185.199.111.153` |
| **CNAME** | `www` | `the-shoaib2.github.io` |

Remove any conflicting parking or redirect records for `@` and `www`.

### 2. GitHub Pages

1. Repo **Settings** → **Pages**
2. **Custom domain:** `theshoaib.me`
3. Wait for DNS check (can take up to 24h, often minutes)
4. Enable **Enforce HTTPS**

The file `public/CNAME` is already set to `theshoaib.me`.

### 3. Cloudflare Turnstile

Add **theshoaib.me** and **www.theshoaib.me** to your Turnstile widget domains.

### 4. Contact API Worker

After changing `ALLOWED_ORIGINS` in `workers/contact-api/wrangler.toml`, redeploy:

```bash
cd workers/contact-api && npx wrangler deploy
```

---

## Resume download (PDF + tracking)

The resume at **`/resume`** builds a PDF in the browser. Successful downloads can increment a counter in **Cloudflare KV** and send a **Telegram** alert (with Turnstile bot protection).

Full details — pipeline, storage keys, security, and CLI commands:

**[docs/resume-download.md](docs/resume-download.md)**

Portfolio content encryption (Network tab shows `data.enc` only):

**[docs/portfolio-data-encryption.md](docs/portfolio-data-encryption.md)**

---

<div align="center">
  <sub>Created by <a href="https://github.com/the-shoaib2">MD Shoaib Khan</a></sub>
</div>
