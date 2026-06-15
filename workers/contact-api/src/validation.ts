export const FIELD_LIMITS = {
  name: 100,
  email: 254,
  subject: 200,
  message: 5000,
} as const;

export const MAX_BODY_BYTES = 16_384;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidatedContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  turnstileToken: string;
}

export function isAllowedOrigin(request: Request, allowedOrigin: string): boolean {
  const origin = request.headers.get('Origin');
  if (origin) {
    return origin === allowedOrigin;
  }

  const referer = request.headers.get('Referer');
  if (referer) {
    try {
      return new URL(referer).origin === allowedOrigin;
    } catch {
      return false;
    }
  }

  return true;
}

export function validateContactPayload(body: {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  turnstileToken?: string;
  honey_pot?: string;
}): { ok: true; payload: ValidatedContactPayload } | { ok: false; error: string } {
  if (body.honey_pot?.trim()) {
    return { ok: false, error: '__HONEYPOT__' };
  }

  const name = body.name?.trim() ?? '';
  const email = body.email?.trim() ?? '';
  const message = body.message?.trim() ?? '';
  const subject = body.subject?.trim() ?? '';
  const turnstileToken = body.turnstileToken?.trim() ?? '';

  if (!name || !email || !message || !turnstileToken) {
    return { ok: false, error: 'Missing required contact fields or security token.' };
  }

  if (name.length > FIELD_LIMITS.name) {
    return { ok: false, error: 'Name is too long.' };
  }

  if (email.length > FIELD_LIMITS.email || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: 'Please provide a valid email address.' };
  }

  if (subject.length > FIELD_LIMITS.subject) {
    return { ok: false, error: 'Subject is too long.' };
  }

  if (message.length > FIELD_LIMITS.message) {
    return { ok: false, error: 'Message is too long.' };
  }

  return {
    ok: true,
    payload: { name, email, subject, message, turnstileToken },
  };
}
