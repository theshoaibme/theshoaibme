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

const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
});

function json(
  data: Record<string, unknown>,
  status = 200,
  origin = '*',
  extraHeaders: Record<string, string> = {},
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
      ...extraHeaders,
    },
  });
}

async function verifyTurnstile(
  secret: string,
  token: string,
  remoteIp: string | null,
): Promise<boolean> {
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret,
      response: token,
      ...(remoteIp ? { remoteip: remoteIp } : {}),
    }),
  });

  const result = (await response.json()) as { success?: boolean };
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
    const allowedOrigin = env.ALLOWED_ORIGIN || 'https://the-shoaib2.github.io';

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(allowedOrigin) });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed.' }, 405, allowedOrigin);
    }

    if (!isAllowedOrigin(request, allowedOrigin)) {
      return json({ error: 'Forbidden.' }, 403, allowedOrigin);
    }

    const contentLength = Number.parseInt(request.headers.get('Content-Length') ?? '0', 10);
    if (contentLength > MAX_BODY_BYTES) {
      return json({ error: 'Request body is too large.' }, 413, allowedOrigin);
    }

    const rateLimit = await checkRateLimit(request);
    if (!rateLimit.allowed) {
      return json(
        { error: 'Too many requests. Please try again later.' },
        429,
        allowedOrigin,
        rateLimit.retryAfter ? { 'Retry-After': String(rateLimit.retryAfter) } : {},
      );
    }

    let body: ContactRequestBody;

    try {
      body = (await request.json()) as ContactRequestBody;
    } catch {
      return json({ error: 'Invalid JSON body.' }, 400, allowedOrigin);
    }

    const validation = validateContactPayload(body);
    if (!validation.ok) {
      if (validation.error === '__HONEYPOT__') {
        return json({ success: true }, 200, allowedOrigin);
      }
      return json({ error: validation.error }, 400, allowedOrigin);
    }

    try {
      const remoteIp = request.headers.get('CF-Connecting-IP');
      const turnstileValid = await verifyTurnstile(
        env.TURNSTILE_SECRET_KEY,
        validation.payload.turnstileToken,
        remoteIp,
      );

      if (!turnstileValid) {
        return json({ error: 'Security verification failed. Please try again.' }, 400, allowedOrigin);
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

      return json({ success: true }, 200, allowedOrigin);
    } catch (error) {
      console.error('Contact delivery failed:', error);
      return json({ error: 'Unable to send message. Please try again later.' }, 500, allowedOrigin);
    }
  },
};
