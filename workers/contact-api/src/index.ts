interface Env {
  RECAPTCHA_SECRET: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  EMAILJS_PUBLIC_KEY: string;
  EMAILJS_SERVICE_ID: string;
  EMAILJS_TEMPLATE_ID: string;
  ALLOWED_ORIGIN?: string;
}

interface ContactRequestBody {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  captchaToken?: string;
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

async function verifyRecaptcha(secret: string, token: string): Promise<boolean> {
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret,
      response: token,
    }),
  });

  const result = (await response.json()) as { success?: boolean };
  return Boolean(result.success);
}

async function sendEmail(env: Env, payload: Required<ContactRequestBody>) {
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: env.EMAILJS_SERVICE_ID,
      template_id: env.EMAILJS_TEMPLATE_ID,
      user_id: env.EMAILJS_PUBLIC_KEY,
      template_params: {
        from_name: payload.name,
        from_email: payload.email,
        subject: payload.subject,
        message: payload.message,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Email delivery failed (${response.status}).`);
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
    const captchaToken = body.captchaToken?.trim();

    if (!name || !email || !message || !captchaToken) {
      return json({ error: 'Missing required contact fields or captcha token.' }, 400, allowedOrigin);
    }

    try {
      const captchaValid = await verifyRecaptcha(env.RECAPTCHA_SECRET, captchaToken);

      if (!captchaValid) {
        return json({ error: 'Robot verification failed. Please try again.' }, 400, allowedOrigin);
      }

      const payload = { name, email, subject, message, captchaToken };

      await Promise.all([sendEmail(env, payload), sendTelegram(env, payload)]);

      return json({ success: true }, 200, allowedOrigin);
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'Failed to send message.';
      return json({ error: messageText }, 500, allowedOrigin);
    }
  },
};
