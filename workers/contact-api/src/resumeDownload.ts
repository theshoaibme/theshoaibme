import { DEFAULT_ALLOWED_ORIGINS } from './allowedOrigins';
import { corsHeaders, parseAllowedOrigins, resolveRequestOrigin } from './cors';
import { hashIp } from './crypto';
import { json, rejectCors } from './http';
import { assertResumeDownloadRequest, isAllowedReferrerOrigin } from './requestSecurity';
import { checkRateLimit } from './rateLimit';
import { verifyTurnstile } from './turnstile';
import { isAllowedOrigin } from './validation';

const TOTAL_COUNT_KEY = 'total';
const LAST_DOWNLOAD_AT_KEY = 'last_download_at';
const MAX_RESUME_DOWNLOAD_BODY_BYTES = 2048;
const MAX_TURNSTILE_TOKEN_LENGTH = 4096;
const MAX_IP_DOWNLOADS_PER_DAY = 5;
const TURNSTILE_REPLAY_TTL_SECONDS = 600;

interface Env {
  TURNSTILE_SECRET_KEY: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  DOWNLOAD_STATS: KVNamespace;
  ALLOWED_ORIGINS?: string;
  ALLOWED_ORIGIN?: string;
}

interface ResumeDownloadBody {
  source?: string;
  referrer?: string;
  turnstileToken?: string;
  honey_pot?: string;
}

function getAllowedOrigins(env: Env): string[] {
  const configured = parseAllowedOrigins(env.ALLOWED_ORIGINS ?? env.ALLOWED_ORIGIN);
  return [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...configured])];
}

function dailyCountKey(date = new Date()): string {
  return `daily:${date.toISOString().slice(0, 10)}`;
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

function sanitizeReferrer(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return undefined;
    }

    return truncate(url.toString(), 500);
  } catch {
    return undefined;
  }
}

function sanitizeSource(value: string | undefined): string {
  const trimmed = value?.trim() ?? 'resume-page';
  return truncate(trimmed.replace(/[^\w.-]+/g, '-'), 64) || 'resume-page';
}

async function incrementDownloadStats(env: Env): Promise<{
  total: number;
  daily: number;
}> {
  const totalRaw = await env.DOWNLOAD_STATS.get(TOTAL_COUNT_KEY);
  const total = (Number.parseInt(totalRaw ?? '0', 10) || 0) + 1;

  const dailyKey = dailyCountKey();
  const dailyRaw = await env.DOWNLOAD_STATS.get(dailyKey);
  const daily = (Number.parseInt(dailyRaw ?? '0', 10) || 0) + 1;

  await Promise.all([
    env.DOWNLOAD_STATS.put(TOTAL_COUNT_KEY, String(total)),
    env.DOWNLOAD_STATS.put(dailyKey, String(daily)),
    env.DOWNLOAD_STATS.put(LAST_DOWNLOAD_AT_KEY, new Date().toISOString()),
  ]);

  return { total, daily };
}

async function checkIpDailyLimit(env: Env, ipHash: string): Promise<boolean> {
  const ipDailyKey = `ip:${ipHash}:${dailyCountKey()}`;
  const current = Number.parseInt((await env.DOWNLOAD_STATS.get(ipDailyKey)) ?? '0', 10) || 0;

  if (current >= MAX_IP_DOWNLOADS_PER_DAY) {
    return false;
  }

  await env.DOWNLOAD_STATS.put(ipDailyKey, String(current + 1), {
    expirationTtl: 86_400,
  });

  return true;
}

async function reserveTurnstileToken(env: Env, token: string): Promise<boolean> {
  const tokenHash = await hashIp(token, 'turnstile-replay');
  const replayKey = `turnstile:${tokenHash}`;

  if (await env.DOWNLOAD_STATS.get(replayKey)) {
    return false;
  }

  await env.DOWNLOAD_STATS.put(replayKey, '1', {
    expirationTtl: TURNSTILE_REPLAY_TTL_SECONDS,
  });

  return true;
}

async function notifyResumeDownloadTelegram(
  env: Env,
  stats: { total: number; daily: number },
  meta: { source: string; referrer?: string; ipHash: string },
): Promise<void> {
  const lines = [
    'Resume downloaded',
    '',
    `Total downloads: ${stats.total}`,
    `Today: ${stats.daily}`,
    `Source: ${meta.source}`,
    `Time: ${new Date().toISOString()}`,
    `Visitor: ${meta.ipHash.slice(0, 12)}`,
  ];

  if (meta.referrer) {
    lines.push(`Referrer: ${meta.referrer}`);
  }

  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text: lines.join('\n'),
    }),
  });

  if (!response.ok) {
    console.error('Resume download Telegram failed:', response.status, await response.text());
    throw new Error('TELEGRAM_DELIVERY_FAILED');
  }
}

export async function handleResumeDownload(request: Request, env: Env): Promise<Response> {
  const allowedOrigins = getAllowedOrigins(env);
  const corsOrigin = resolveRequestOrigin(request, allowedOrigins);

  if (request.method === 'OPTIONS') {
    if (!corsOrigin) {
      return rejectCors();
    }

    return new Response(null, { status: 204, headers: corsHeaders(corsOrigin) });
  }

  if (request.method !== 'POST') {
    if (!corsOrigin) {
      return rejectCors();
    }

    return json({ error: 'Method not allowed.' }, 405, corsOrigin);
  }

  const security = assertResumeDownloadRequest(request, allowedOrigins);
  if (!security.ok) {
    if (!corsOrigin) {
      return rejectCors();
    }

    return json({ error: 'Request blocked for security reasons.' }, 403, corsOrigin);
  }

  if (!isAllowedOrigin(request, allowedOrigins)) {
    return rejectCors();
  }

  const contentLength = Number.parseInt(request.headers.get('Content-Length') ?? '0', 10);
  if (contentLength > MAX_RESUME_DOWNLOAD_BODY_BYTES) {
    return json({ error: 'Request body is too large.' }, 413, security.corsOrigin);
  }

  const rateLimit = await checkRateLimit(request, {
    scope: 'resume-download',
    maxRequests: 3,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return json(
      { error: 'Too many download events. Please try again later.' },
      429,
      security.corsOrigin,
      rateLimit.retryAfter ? { 'Retry-After': String(rateLimit.retryAfter) } : {},
    );
  }

  let body: ResumeDownloadBody;

  try {
    body = (await request.json()) as ResumeDownloadBody;
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400, security.corsOrigin);
  }

  if (body.honey_pot?.trim()) {
    return json({ success: true, tracked: false }, 200, security.corsOrigin);
  }

  const turnstileToken = body.turnstileToken?.trim() ?? '';
  if (!turnstileToken || turnstileToken.length > MAX_TURNSTILE_TOKEN_LENGTH) {
    return json(
      { error: 'Security verification is required before tracking a download.' },
      400,
      security.corsOrigin,
    );
  }

  if (!env.TURNSTILE_SECRET_KEY?.trim()) {
    console.error('TURNSTILE_SECRET_KEY is not configured.');
    return json({ error: 'Download tracking is not fully configured.' }, 503, security.corsOrigin);
  }

  if (!env.TELEGRAM_BOT_TOKEN?.trim() || !env.TELEGRAM_CHAT_ID?.trim()) {
    console.error('Telegram is not configured for resume download notifications.');
    return json({ error: 'Download tracking is not fully configured.' }, 503, security.corsOrigin);
  }

  const source = sanitizeSource(body.source);
  const referrer =
    sanitizeReferrer(body.referrer) ??
    sanitizeReferrer(request.headers.get('Referer') ?? undefined);

  if (!isAllowedReferrerOrigin(referrer, allowedOrigins)) {
    return json({ error: 'Request blocked for security reasons.' }, 403, security.corsOrigin);
  }

  const remoteIp = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const ipHash = await hashIp(remoteIp, env.TURNSTILE_SECRET_KEY);

  const ipAllowed = await checkIpDailyLimit(env, ipHash);
  if (!ipAllowed) {
    return json(
      { error: 'Daily download tracking limit reached for this network.' },
      429,
      security.corsOrigin,
    );
  }

  const turnstileValid = await verifyTurnstile(env.TURNSTILE_SECRET_KEY, turnstileToken, remoteIp);
  if (!turnstileValid) {
    return json(
      { error: 'Security verification failed. Please try downloading again.' },
      400,
      security.corsOrigin,
    );
  }

  const tokenReserved = await reserveTurnstileToken(env, turnstileToken);
  if (!tokenReserved) {
    return json({ error: 'Security verification token was already used.' }, 409, security.corsOrigin);
  }

  try {
    const stats = await incrementDownloadStats(env);
    await notifyResumeDownloadTelegram(env, stats, { source, referrer, ipHash });

    return json({ success: true, tracked: true }, 200, security.corsOrigin);
  } catch (error) {
    console.error('Resume download tracking failed:', error);
    return json({ error: 'Unable to record download. Please try again later.' }, 500, security.corsOrigin);
  }
}
