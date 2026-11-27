import { NextResponse } from 'next/server';
import {
  getClientIp,
  hashClientIp,
  isRateLimited,
  verifyTurnstileIfConfigured,
} from '@/lib/apiSecurity';
import { escapeHtml, sendTelegramMessage } from '@/lib/telegram';

interface ResumeDownloadRequestBody {
  source?: unknown;
  referrer?: unknown;
  turnstileToken?: unknown;
  honey_pot?: unknown;
}

const RESUME_RATE_LIMIT_MAX = 5;
const RESUME_RATE_LIMIT_WINDOW_MS = 60_000;

function formatLocation(request: Request): string {
  const city = request.headers.get('x-vercel-ip-city')?.trim();
  const country = request.headers.get('x-vercel-ip-country')?.trim();

  if (city && country) {
    return `${decodeURIComponent(city)}, ${country}`;
  }
  if (country) {
    return country;
  }
  return 'Unknown';
}

export async function POST(request: Request) {
  let body: ResumeDownloadRequestBody = {};
  try {
    body = (await request.json()) as ResumeDownloadRequestBody;
  } catch {
    body = {};
  }

  const honeyPot = typeof body.honey_pot === 'string' ? body.honey_pot.trim() : '';
  if (honeyPot) {
    return NextResponse.json({ success: true, tracked: false });
  }

  const clientIp = getClientIp(request);
  if (
    isRateLimited(
      `resume-download:${clientIp}`,
      RESUME_RATE_LIMIT_MAX,
      RESUME_RATE_LIMIT_WINDOW_MS,
    )
  ) {
    return NextResponse.json(
      { success: false, tracked: false, error: 'Too many requests.' },
      { status: 429 },
    );
  }

  const turnstileValid = await verifyTurnstileIfConfigured(body.turnstileToken, clientIp);
  if (!turnstileValid) {
    return NextResponse.json(
      { success: false, tracked: false, error: 'Security verification failed.' },
      { status: 403 },
    );
  }

  const source =
    typeof body.source === 'string' && body.source.trim()
      ? body.source.trim().slice(0, 100)
      : 'resume-page';
  const referrer =
    typeof body.referrer === 'string' && body.referrer.trim()
      ? body.referrer.trim().slice(0, 300)
      : 'Direct';
  const location = formatLocation(request);
  const visitorHash = hashClientIp(clientIp);
  const downloadedAt = new Date().toISOString();

  const text = [
    '<b>Resume Downloaded</b>',
    '',
    `<b>Source:</b> ${escapeHtml(source)}`,
    `<b>Referrer:</b> ${escapeHtml(referrer)}`,
    `<b>Location:</b> ${escapeHtml(location)}`,
    `<b>Visitor:</b> <code>${escapeHtml(visitorHash)}</code>`,
    `<b>Time:</b> ${escapeHtml(downloadedAt)}`,
  ].join('\n');

  const telegramResult = await sendTelegramMessage(text);
  if (!telegramResult.ok) {
    return NextResponse.json(
      {
        success: false,
        tracked: false,
        error: telegramResult.error ?? 'Failed to deliver notification to Telegram.',
      },
      { status: telegramResult.status },
    );
  }

  return NextResponse.json({ success: true, tracked: true });
}
