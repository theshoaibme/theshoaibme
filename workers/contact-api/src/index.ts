import { corsHeaders, parseAllowedOrigins, resolveRequestOrigin } from './cors';
import { checkRateLimit } from './rateLimit';
import {
  isAllowedOrigin,
  MAX_BODY_BYTES,
  validateContactPayload,
  type ValidatedContactPayload,
} from './validation';

interface Env {
  TURNSTILE_SECRET_KEY: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  EMAILJS_PUBLIC_KEY: string;
  EMAILJS_PRIVATE_KEY: string;
  EMAILJS_SERVICE_ID: string;
  EMAILJS_TEMPLATE_ID: string;
  ALLOWED_ORIGINS?: string;
  ALLOWED_ORIGIN?: string;
}

interface ContactRequestBody {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  turnstileToken?: string;
  honey_pot?: string;
}

function getAllowedOrigins(env: Env): string[] {
  return parseAllowedOrigins(env.ALLOWED_ORIGINS ?? env.ALLOWED_ORIGIN);
}

function json(
  data: Record<string, unknown>,
  status: number,
  corsOrigin: string,
  extraHeaders: Record<string, string> = {},
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(corsOrigin),
      ...extraHeaders,
    },
  });
}

function rejectCors(status = 403): Response {
  return new Response(JSON.stringify({ error: 'Origin not allowed.' }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function verifyTurnstile(
  secret: string,
  token: string,
  remoteIp: string | null,
): Promise<boolean> {
  const body = new URLSearchParams({
    secret,
    response: token,
  });

  if (remoteIp) {
    body.set('remoteip', remoteIp);
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    console.error('Turnstile siteverify HTTP error:', response.status);
    return false;
  }

  const result = (await response.json()) as { success?: boolean; 'error-codes'?: string[] };

  if (!result.success) {
    console.error('Turnstile verification failed:', result['error-codes']?.join(', ') ?? 'unknown');
  }

  return Boolean(result.success);
}

async function sendEmail(env: Env, payload: ValidatedContactPayload) {
  if (!env.EMAILJS_PRIVATE_KEY) {
    throw new Error('EMAILJS_PRIVATE_KEY is not configured.');
  }

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: env.EMAILJS_SERVICE_ID,
      template_id: env.EMAILJS_TEMPLATE_ID,
      user_id: env.EMAILJS_PUBLIC_KEY,
      accessToken: env.EMAILJS_PRIVATE_KEY,
      template_params: {
        from_name: payload.name,
        from_email: payload.email,
        subject: payload.subject,
        message: payload.message,
      },
    }),
  });

  if (!response.ok) {
    console.error('EmailJS delivery failed:', response.status, await response.text());
    throw new Error('EMAIL_DELIVERY_FAILED');
  }
}

async function sendTelegram(env: Env, payload: ValidatedContactPayload) {
  const text = [
    'New portfolio contact message',
    '',
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Subject: ${payload.subject || 'No subject'}`,
    '',
    payload.message,
  ].join('\n');

  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text,
    }),
  });

  if (!response.ok) {
    console.error('Telegram delivery failed:', response.status, await response.text());
    throw new Error('TELEGRAM_DELIVERY_FAILED');
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
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

    if (!corsOrigin || !isAllowedOrigin(request, allowedOrigins)) {
      return rejectCors();
    }

    const contentLength = Number.parseInt(request.headers.get('Content-Length') ?? '0', 10);
    if (contentLength > MAX_BODY_BYTES) {
      return json({ error: 'Request body is too large.' }, 413, corsOrigin);
    }

    const rateLimit = await checkRateLimit(request);
    if (!rateLimit.allowed) {
      return json(
        { error: 'Too many requests. Please try again later.' },
        429,
        corsOrigin,
        rateLimit.retryAfter ? { 'Retry-After': String(rateLimit.retryAfter) } : {},
      );
    }

    let body: ContactRequestBody;

    try {
      body = (await request.json()) as ContactRequestBody;
    } catch {
      return json({ error: 'Invalid JSON body.' }, 400, corsOrigin);
    }

    const validation = validateContactPayload(body);
    if (!validation.ok) {
      if (validation.error === '__HONEYPOT__') {
        return json({ success: true }, 200, corsOrigin);
      }
      return json({ error: validation.error }, 400, corsOrigin);
    }

    if (!env.TURNSTILE_SECRET_KEY?.trim()) {
      console.error('TURNSTILE_SECRET_KEY is not configured.');
      return json({ error: 'Contact service is not fully configured.' }, 503, corsOrigin);
    }

    try {
      const remoteIp = request.headers.get('CF-Connecting-IP');
      const turnstileValid = await verifyTurnstile(
        env.TURNSTILE_SECRET_KEY,
        validation.payload.turnstileToken,
        remoteIp,
      );

      if (!turnstileValid) {
        return json(
          { error: 'Security verification failed. Please complete the check and try again.' },
          400,
          corsOrigin,
        );
      }

      const [emailResult, telegramResult] = await Promise.allSettled([
        sendEmail(env, validation.payload),
        sendTelegram(env, validation.payload),
      ]);

      if (telegramResult.status === 'rejected') {
        throw telegramResult.reason;
      }

      if (emailResult.status === 'rejected') {
        throw emailResult.reason;
      }

      return json({ success: true }, 200, corsOrigin);
    } catch (error) {
      console.error('Contact delivery failed:', error);
      return json({ error: 'Unable to send message. Please try again later.' }, 500, corsOrigin);
    }
  },
};
