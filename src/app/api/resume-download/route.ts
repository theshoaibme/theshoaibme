import { NextResponse } from 'next/server';
import {
  getClientIp,
  hashClientIp,
  isAllowedOrigin,
  isRateLimited,
  verifyTurnstileIfConfigured,
} from '@/lib/apiSecurity';
import { getResumeDownloadCount, recordResumeDownload } from '@/lib/resumeCounter';
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

export async function GET() {
  const { totalDownloads, persistent } = await getResumeDownloadCount();
  return NextResponse.json({
    success: true,
    totalDownloads,
    persistent,
  });
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json(
      { success: false, tracked: false, error: 'Forbidden origin.' },
      { status: 403 },
    );
  }

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

  const hasTurnstileToken =
    typeof body.turnstileToken === 'string' && body.turnstileToken.trim().length > 0;
  if (hasTurnstileToken) {
    const turnstileValid = await verifyTurnstileIfConfigured(body.turnstileToken, clientIp);
    if (!turnstileValid) {
      return NextResponse.json(
        { success: false, tracked: false, error: 'Security verification failed.' },
        { status: 403 },
      );
    }
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

  const stats = await recordResumeDownload(visitorHash);
  const storageSuffix = stats.persistent ? '' : ' <i>(instance)</i>';

  const text = [
    `📄 <b>Resume Downloaded (#${stats.totalDownloads})</b>`,
    '',
    `<b>Total Downloads:</b> ${stats.totalDownloads}${storageSuffix}`,
    `<b>Today (UTC):</b> ${stats.todayDownloads}`,
    `<b>Unique Visitors:</b> ${stats.uniqueVisitors}`,
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
        totalDownloads: stats.totalDownloads,
        error: telegramResult.error ?? 'Failed to deliver notification to Telegram.',
      },
      { status: telegramResult.status },
    );
  }

  return NextResponse.json({
    success: true,
    tracked: true,
    totalDownloads: stats.totalDownloads,
    todayDownloads: stats.todayDownloads,
    uniqueVisitors: stats.uniqueVisitors,
    persistent: stats.persistent,
  });
}
