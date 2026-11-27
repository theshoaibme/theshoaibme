import { NextResponse } from 'next/server';
import { getContactFieldErrors, getFirstContactFieldError } from '@/config/contactValidation';
import { getClientIp, isRateLimited, verifyTurnstileIfConfigured } from '@/lib/apiSecurity';
import { formatNotificationTimestamp, resolveVisitorMetadata } from '@/lib/requestMetadata';
import { escapeHtml, sendTelegramMessage } from '@/lib/telegram';

interface ContactRequestBody {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  turnstileToken?: unknown;
  honey_pot?: unknown;
}

const CONTACT_RATE_LIMIT_MAX = 5;
const CONTACT_RATE_LIMIT_WINDOW_MS = 60_000;

export async function POST(request: Request) {
  let body: ContactRequestBody;
  try {
    body = (await request.json()) as ContactRequestBody;
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const honeyPot = typeof body.honey_pot === 'string' ? body.honey_pot.trim() : '';
  if (honeyPot) {
    return NextResponse.json({ success: true });
  }

  const clientIp = getClientIp(request);
  if (isRateLimited(`contact:${clientIp}`, CONTACT_RATE_LIMIT_MAX, CONTACT_RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please wait a minute and try again.' },
      { status: 429 },
    );
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  const fieldErrors = getContactFieldErrors({
    user_name: name,
    user_email: email,
    subject,
    message,
  });
  const firstError = getFirstContactFieldError(fieldErrors);
  if (firstError) {
    return NextResponse.json({ success: false, error: firstError }, { status: 400 });
  }

  const turnstileValid = await verifyTurnstileIfConfigured(body.turnstileToken, clientIp);
  if (!turnstileValid) {
    return NextResponse.json(
      { success: false, error: 'Security verification failed. Please try again.' },
      { status: 403 },
    );
  }

  const visitor = await resolveVisitorMetadata(request, clientIp);
  const sentAt = formatNotificationTimestamp();

  const text = [
    '✉️ <b>New Portfolio Contact Message</b>',
    '',
    `<b>Name:</b> ${escapeHtml(name)}`,
    `<b>Email:</b> ${escapeHtml(email)}`,
    `<b>Subject:</b> ${subject ? escapeHtml(subject) : '(No subject)'}`,
    `<b>Location:</b> ${escapeHtml(visitor.location)}`,
    `<b>Time:</b> ${escapeHtml(sentAt)}`,
    '',
    '<b>Message:</b>',
    escapeHtml(message),
  ].join('\n');

  const telegramResult = await sendTelegramMessage(text);
  if (!telegramResult.ok) {
    return NextResponse.json(
      { success: false, error: telegramResult.error ?? 'Failed to deliver message to Telegram.' },
      { status: telegramResult.status },
    );
  }

  return NextResponse.json({ success: true });
}
