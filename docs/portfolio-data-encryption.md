# Portfolio data encryption

Site content is stored as **`data/portfolio.json`** in the repo. At dev/build time it is encrypted to **`public/data.enc`**. The browser fetches only the encrypted file.

---

## What you see in Network tab

| Request | Response |
|---------|----------|
| `GET /data.enc` | Binary ciphertext (AES-256-GCM) |
| `GET /data.json` | **404** (blocked in dev/preview; not deployed in production) |

Plain JSON is never returned by the app.

---

## Setup

1. Generate a 32-byte key:

```bash
openssl rand -base64 32
```

2. Add to `.env`:

```env
VITE_DATA_ENCRYPTION_KEY=your-base64-key-here
```

3. GitHub Actions: add the same value as secret **`VITE_DATA_ENCRYPTION_KEY`** for deploy and E2E.

4. Edit content in **`data/portfolio.json`**, then:

```bash
pnpm encrypt:data   # or restart pnpm dev (auto-encrypts)
```

---

## Format

`data.enc` layout:

```
[12-byte IV][16-byte GCM tag][ciphertext]
```

Algorithm: **AES-256-GCM**. Key from `VITE_DATA_ENCRYPTION_KEY` (base64).

---

## Production console logs

Production builds strip `console.*` and `debugger` via Vite/esbuild. Dev keeps logs for debugging.

---

## Security note

This is **client-side decryption** — the key is embedded in the production JS bundle. That hides portfolio JSON from casual Network-tab inspection, but a determined user can still extract the key from the bundle. It is obfuscation, not server-side secrecy. For a public portfolio, that is usually enough.

---

## Key files

| File | Role |
|------|------|
| `data/portfolio.json` | Source content (edit this) |
| `public/data.enc` | Generated encrypted payload (gitignored) |
| `scripts/encrypt-portfolio-data.mjs` | Build-time encryption |
| `src/utils/portfolioDataCrypto.ts` | Runtime decryption |
| `src/data/loadPortfolioData.ts` | Fetches `data.enc` |
| `vite.portfolio-data.ts` | Encrypt on dev/build, block `/data.json` |
