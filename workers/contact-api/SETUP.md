# Cloudflare Setup Guide — Contact API

Complete setup for **email + Telegram** notifications from your portfolio contact form.

| Item | Your value |
|---|---|
| Portfolio site | https://the-shoaib2.github.io |
| Worker URL | https://portfolio-contact-api.the-shoaib2.workers.dev |
| Telegram bot | [@the_shoaib_bot](https://t.me/the_shoaib_bot) |
| Your Telegram chat ID | `5187786663` |

---

## What you are building

```text
User fills contact form on GitHub Pages
        ↓
Clicks Send Message → completes reCAPTCHA
        ↓
POST https://portfolio-contact-api.the-shoaib2.workers.dev
        ↓
Cloudflare Worker:
  1. Verifies reCAPTCHA (secret key)
  2. Sends email (EmailJS)
  3. Sends Telegram message (@the_shoaib_bot)
```

---

## Setup checklist

Copy this list and tick each item as you go:

- [ ] **Step 1** — Cloudflare account created
- [ ] **Step 2** — Wrangler CLI installed and logged in
- [ ] **Step 3** — Worker deployed (`npm run deploy`)
- [ ] **Step 4** — 3 Cloudflare secrets added
- [ ] **Step 5** — Worker health check returns `405`
- [ ] **Step 6** — GitHub Actions secrets set
- [ ] **Step 7** — reCAPTCHA domains added in Google
- [ ] **Step 8** — Site redeployed from GitHub Actions
- [ ] **Step 9** — Contact form tested (email + Telegram)

---

## Step 1 — Create a Cloudflare account

1. Go to [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. Sign up (free plan is enough)
3. Verify your email

You do **not** need to add a domain to Cloudflare for Workers on `workers.dev`.

---

## Step 2 — Install Wrangler and log in

Wrangler is Cloudflare’s CLI for deploying Workers.

**Do not use `npm install -g wrangler`** (often fails with permission errors).  
Use the local copy inside this project instead:

```bash
cd workers/contact-api
npm install
npx wrangler login
```

A browser tab opens → log in to Cloudflare → click **Allow**.

Verify login:

```bash
npx wrangler whoami
```

You should see your Cloudflare account email.

---

## Step 3 — Deploy the worker

Open a terminal in your project folder:

```bash
cd workers/contact-api
npm install
npm run deploy
```

**Success looks like:**

```text
Published portfolio-contact-api (https://portfolio-contact-api.the-shoaib2.workers.dev)
```

If the URL is different, update `VITE_CONTACT_API_URL` everywhere to match.

---

## Step 4 — Add Cloudflare secrets (private keys)

Stay in the `workers/contact-api` folder.

These values are **never** stored in GitHub or in your React code.

### Secret 1 — reCAPTCHA secret key

1. Open [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Select your site **the-shoaib2.github.io**
3. Copy the **Secret key** (not the site key)

```bash
npx wrangler secret put RECAPTCHA_SECRET
```

Paste the secret key when prompted → press Enter.

---

### Secret 2 — Telegram bot token

1. Open [@BotFather](https://t.me/BotFather) in Telegram
2. Send `/mybots`
3. Select **@the_shoaib_bot**
4. Tap **API Token** → copy the token

```bash
npx wrangler secret put TELEGRAM_BOT_TOKEN
```

Paste the token when prompted.

> **Never share this token in chat, GitHub, or `.env` files.**  
> If leaked, revoke it in BotFather → **Revoke current token** → generate a new one.

---

### Secret 3 — Telegram chat ID

Your chat ID (from messaging @the_shoaib_bot): **`5187786663`**

If you need to verify later, message the bot then open:

`https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`

Look for `"chat":{"id":5187786663}`.

```bash
npx wrangler secret put TELEGRAM_CHAT_ID
```

Paste: `5187786663`

---

### Confirm all secrets

```bash
npx wrangler secret list
```

Expected output includes:

```text
RECAPTCHA_SECRET
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
```

Redeploy after adding secrets:

```bash
npm run deploy
```

---

## Alternative — Add secrets in Cloudflare Dashboard

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Workers & Pages** → **portfolio-contact-api**
3. **Settings** → **Variables and Secrets**
4. Under **Secrets**, click **Add**
5. Add each secret:

| Name | Value |
|---|---|
| `RECAPTCHA_SECRET` | reCAPTCHA secret key |
| `TELEGRAM_BOT_TOKEN` | Bot token from BotFather |
| `TELEGRAM_CHAT_ID` | `5187786663` |

6. Click **Deploy** (or run `npm run deploy` from terminal)

---

## Step 5 — Test the worker is live

```bash
curl -i https://portfolio-contact-api.the-shoaib2.workers.dev
```

| Response | Meaning |
|---|---|
| `HTTP/2 405` + `"Method not allowed"` | Worker is live |
| `404` or `error code: 1042` | Worker not deployed — repeat Step 3 |

Second test:

```bash
curl -i -X POST https://portfolio-contact-api.the-shoaib2.workers.dev \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected: `400` + `"Missing required contact fields or captcha token."`

---

## Step 6 — GitHub Actions secrets (frontend)

These are **public** values baked into your site at build time.

Go to:  
**github.com/the-shoaib2/the-shoaib2.github.io** → **Settings** → **Secrets and variables** → **Actions**

Add or update:

| Secret name | Value |
|---|---|
| `VITE_RECAPTCHA_SITE_KEY` | reCAPTCHA **site** key (public, starts with `6Ldq...`) |
| `VITE_CONTACT_API_URL` | `https://portfolio-contact-api.the-shoaib2.workers.dev` |

**CLI alternative:**

```bash
gh secret set VITE_RECAPTCHA_SITE_KEY --body "YOUR_SITE_KEY" --repo the-shoaib2/the-shoaib2.github.io
gh secret set VITE_CONTACT_API_URL --body "https://portfolio-contact-api.the-shoaib2.workers.dev" --repo the-shoaib2/the-shoaib2.github.io
```

---

## Step 7 — reCAPTCHA domains (Google)

In [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin), edit your key and add:

- `the-shoaib2.github.io`
- `localhost`

Save changes.

---

## Step 8 — Redeploy your portfolio site

Push any commit to `main`, **or** run the workflow manually:

1. GitHub repo → **Actions**
2. **Deploy to GitHub Pages** → **Run workflow**

Wait for the green checkmark. Your live site will call the Cloudflare Worker.

---

## Step 9 — Local development (optional)

In the project root, create `.env` (already gitignored):

```env
VITE_RECAPTCHA_SITE_KEY=your_site_key_here
VITE_CONTACT_API_URL=https://portfolio-contact-api.the-shoaib2.workers.dev
```

For local testing, temporarily change `ALLOWED_ORIGIN` in `wrangler.toml`:

```toml
ALLOWED_ORIGIN = "http://localhost:5173"
```

Run `npm run deploy` in `workers/contact-api`, test with `npm run dev`, then set it back to:

```toml
ALLOWED_ORIGIN = "https://the-shoaib2.github.io"
```

---

## Step 10 — Full end-to-end test

1. Open https://the-shoaib2.github.io/contact
2. Fill in **Name**, **Email**, **Message**
3. Click **Send Message**
4. Complete the reCAPTCHA checkbox
5. Check:
   - Success message on the form
   - Email in your inbox (EmailJS)
   - Telegram message from [@the_shoaib_bot](https://t.me/the_shoaib_bot)

---

## Where each key lives

| Key | Goes in | Never put in |
|---|---|---|
| reCAPTCHA site key | GitHub Secret `VITE_RECAPTCHA_SITE_KEY` | Cloudflare secrets |
| Worker URL | GitHub Secret `VITE_CONTACT_API_URL` | — |
| reCAPTCHA secret key | Cloudflare `RECAPTCHA_SECRET` | GitHub, `.env`, code |
| Telegram bot token | Cloudflare `TELEGRAM_BOT_TOKEN` | GitHub, `.env`, code |
| Telegram chat ID | Cloudflare `TELEGRAM_CHAT_ID` | GitHub (optional, semi-private) |

---

## Worker config (already set in wrangler.toml)

| Variable | Value |
|---|---|
| `EMAILJS_PUBLIC_KEY` | `0angy-FFhuMJiDUal` |
| `EMAILJS_SERVICE_ID` | `service_c4ug6xj` |
| `EMAILJS_TEMPLATE_ID` | `template_o7kynn5` |
| `ALLOWED_ORIGIN` | `https://the-shoaib2.github.io` |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Worker returns `404` / `1042` | Run `cd workers/contact-api && npm run deploy` |
| `405` on GET but form fails | Check browser console for CORS — verify `ALLOWED_ORIGIN` |
| `Robot verification failed` | Wrong `RECAPTCHA_SECRET` or domain not in Google admin |
| `Telegram delivery failed` | Wrong token or chat ID; redeploy after fixing secrets |
| `Email delivery failed` | Check EmailJS dashboard — service limits / template |
| CORS error on localhost | Set `ALLOWED_ORIGIN = "http://localhost:5173"` and redeploy worker |
| Form uses email only (no Telegram) | `VITE_CONTACT_API_URL` missing — set GitHub secret and redeploy site |

---

## Quick redeploy commands

**After changing worker code or secrets:**

```bash
cd workers/contact-api
npm run deploy
```

**After changing frontend or GitHub secrets:**

Push to `main` or re-run **Deploy to GitHub Pages** workflow.

---

## Security reminders

- Never commit bot tokens or reCAPTCHA secret keys to GitHub
- Never use `VITE_` prefix for private keys (they become public in the JS bundle)
- Revoke and regenerate Telegram token if it was shared publicly
- Only paste secrets into `wrangler secret put` or Cloudflare Dashboard
