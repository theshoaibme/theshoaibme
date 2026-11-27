# Resume download pipeline

The `/resume` page generates a 2-page PDF in the browser and sends a fire-and-forget notification to the Next.js `/api/resume-download` Route Handler, which delivers a Telegram message.

**Routes:** `/resume` and `/cv` (redirects to `/resume`)

---

## How it works

```
User clicks "Download Resume"
  → PDF generated client-side (html2canvas + jsPDF)
  → POST /api/resume-download (Next.js Route Handler)
      → Honeypot + in-memory rate limit + optional Turnstile verify
      → Telegram notification sent via Bot API
```

The PDF is **never uploaded** to a server. Notification tracking is **fire-and-forget** — if it fails, the PDF still downloads.

---

## Environment variables (Server-only)

Set these in `.env` (local) and **Vercel Project Settings → Environment Variables** (production):

| Variable | Required | Purpose |
|----------|----------|---------|
| `TELEGRAM_BOT_TOKEN` | Yes | Bot token from `@BotFather` |
| `TELEGRAM_CHAT_ID` | Yes | Target Telegram chat/user ID |
| `TURNSTILE_SECRET_KEY` | No | Enables server-side Turnstile verification when set |

---

## Key files

| File | Role |
|------|------|
| `src/views/ResumePage.tsx` | UI and download button |
| `src/utils/resumeDownloadPipeline.ts` | Generates PDF then triggers async notification |
| `src/utils/downloadResumePdf.ts` | Client-side PDF generation |
| `src/utils/resumeDownloadApi.ts` | `POST /api/resume-download` client helper |
| `src/config/download.ts` | API URL helper (defaults to `/api/resume-download`) |
| `src/app/api/resume-download/route.ts` | Next.js Route Handler |
| `src/lib/telegram.ts` | Shared server-side Telegram Bot API client |
| `src/lib/apiSecurity.ts` | Rate limiting, IP hashing, optional Turnstile verification |
