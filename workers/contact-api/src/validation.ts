import { resolveRequestOrigin } from './cors';

export const FIELD_LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  subject: { max: 200 },
  message: { min: 10, max: 5000 },
} as const;

export const MAX_BODY_BYTES = 16_384;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_PATTERN = /^[\p{L}\p{M}0-9\s'.-]+$/u;

export interface ValidatedContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  turnstileToken: string;
}

export function isAllowedOrigin(request: Request, allowedOrigins: string[]): boolean {
  return resolveRequestOrigin(request, allowedOrigins) !== null;
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

  if (name.length < FIELD_LIMITS.name.min || name.length > FIELD_LIMITS.name.max) {
    return { ok: false, error: `Name must be between ${FIELD_LIMITS.name.min} and ${FIELD_LIMITS.name.max} characters.` };
  }

  const letterCount = (name.match(/[\p{L}\p{M}]/gu) ?? []).length;
  if (letterCount < FIELD_LIMITS.name.min || !NAME_PATTERN.test(name)) {
    return { ok: false, error: 'Please provide a valid name.' };
  }

  if (email.length > FIELD_LIMITS.email.max || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: 'Please provide a valid email address.' };
  }

  if (subject.length > FIELD_LIMITS.subject.max) {
    return { ok: false, error: 'Subject is too long.' };
  }

  if (message.length < FIELD_LIMITS.message.min || message.length > FIELD_LIMITS.message.max) {
    return {
      ok: false,
      error: `Message must be between ${FIELD_LIMITS.message.min} and ${FIELD_LIMITS.message.max} characters.`,
    };
  }

  return {
    ok: true,
    payload: { name, email, subject, message, turnstileToken },
  };
}
