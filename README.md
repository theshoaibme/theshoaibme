# MD Shoaib Khan — Portfolio

Personal portfolio website showcasing my work, skills, services, and contact details.

**Live site:** [theshoaib.me](https://theshoaib.me) · [the-shoaib2.github.io](https://the-shoaib2.github.io)

[![Homepage preview](https://s0.wp.com/mshots/v1/https://theshoaib.me/#hero)](https://theshoaib.me/#hero)

---

## Edit your content

Most of the site text, projects, skills, and contact info live in one file:

**`public/data.json`**

Open that file, update what you need, save, and refresh the site.

---

## Run locally

You need [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) installed.

```bash
pnpm install
pnpm dev
```

Then open **http://localhost:5173** in your browser.

Copy `.env.example` to `.env` and set `VITE_TURNSTILE_SITE_KEY` and `VITE_CONTACT_API_URL`.

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

<div align="center">
  <sub>Created by <a href="https://github.com/the-shoaib2">MD Shoaib Khan</a></sub>
</div>
