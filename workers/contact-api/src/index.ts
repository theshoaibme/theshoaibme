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
}

const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
});

function json(data: Record<string, unknown>, status = 200, origin = '*') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
    },
  });
}

async function verifyTurnstile(secret: string, token: string): Promise<boolean> {
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret,
      response: token,
    }),
  });

  const result = (await response.json()) as { success?: boolean };
  return Boolean(result.success);
}

async function sendEmail(env: Env, payload: Required<ContactRequestBody>) {
  if (!env.EMAILJS_PRIVATE_KEY) {
    throw new Error(
      'EmailJS private key is not configured. Run: npx wrangler secret put EMAILJS_PRIVATE_KEY',
    );
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
    const details = (await response.text()).trim();
    const hint =
      response.status === 403
        ? ' Enable non-browser API access in EmailJS Account → Security and set EMAILJS_PRIVATE_KEY on the worker.'
        : '';
    throw new Error(`Email delivery failed (${response.status})${details ? `: ${details}` : ''}.${hint}`);
  }
}

async function sendTelegram(env: Env, payload: Required<ContactRequestBody>) {
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
    throw new Error(`Telegram delivery failed (${response.status}).`);
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

    let body: ContactRequestBody;

    try {
      body = (await request.json()) as ContactRequestBody;
    } catch {
      return json({ error: 'Invalid JSON body.' }, 400, allowedOrigin);
    }

    const name = body.name?.trim();
    const email = body.email?.trim();
    const message = body.message?.trim();
    const subject = body.subject?.trim() ?? '';
    const turnstileToken = body.turnstileToken?.trim();

    if (!name || !email || !message || !turnstileToken) {
      return json({ error: 'Missing required contact fields or security token.' }, 400, allowedOrigin);
    }

    try {
      const turnstileValid = await verifyTurnstile(env.TURNSTILE_SECRET_KEY, turnstileToken);

      if (!turnstileValid) {
        return json({ error: 'Security verification failed. Please try again.' }, 400, allowedOrigin);
      }

      const payload = { name, email, subject, message, turnstileToken };

      const [emailResult, telegramResult] = await Promise.allSettled([
        sendEmail(env, payload),
        sendTelegram(env, payload),
      ]);

      if (telegramResult.status === 'rejected') {
        throw telegramResult.reason;
      }

      if (emailResult.status === 'rejected') {
        throw emailResult.reason;
      }

      return json({ success: true }, 200, allowedOrigin);
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'Failed to send message.';
      return json({ error: messageText }, 500, allowedOrigin);
    }
  },
};
