import {
  getContactApiUrl,
  getTelegramBotToken,
  getTelegramChatId,
  isDirectTelegramConfigured,
} from '@/config/contact';
import { getErrorMessage } from '@/utils/errors';

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  turnstileToken?: string;
  honey_pot?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatTelegramMessage(payload: ContactPayload): string {
  return [
    '<b>New Portfolio Contact Message</b>',
    '',
    `<b>Name:</b> ${escapeHtml(payload.name)}`,
    `<b>Email:</b> ${escapeHtml(payload.email)}`,
    `<b>Subject:</b> ${escapeHtml(payload.subject)}`,
    '',
    '<b>Message:</b>',
    escapeHtml(payload.message),
  ].join('\n');
}

function getNetworkErrorMessage(error: unknown): string {
  const message = getErrorMessage(error, '');

  if (error instanceof TypeError || /failed to fetch|networkerror|load failed/i.test(message)) {
    return 'Unable to reach Telegram. Check your connection, then try again.';
  }

  return message || 'Unable to send message. Please try again later.';
}

async function sendDirectToTelegram(payload: ContactPayload): Promise<void> {
  const botToken = getTelegramBotToken();
  const chatId = getTelegramChatId();

  let response: Response;
  try {
    response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatTelegramMessage(payload),
        parse_mode: 'HTML',
      }),
    });
  } catch (error) {
    throw new Error(getNetworkErrorMessage(error));
  }

  let result: { ok?: boolean; description?: string } = {};
  try {
    result = (await response.json()) as { ok?: boolean; description?: string };
  } catch {
    result = {};
  }

  if (!response.ok || !result.ok) {
    throw new Error(result.description ?? `Telegram delivery failed (${response.status}).`);
  }
}

export async function sendContactViaApi(_apiUrl: string, payload: ContactPayload): Promise<void> {
  if (isDirectTelegramConfigured()) {
    await sendDirectToTelegram(payload);
    return;
  }

  const url = getContactApiUrl();
  let response: Response;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error(getNetworkErrorMessage(error));
  }

  let result: { error?: string; success?: boolean } = {};
  try {
    result = (await response.json()) as { error?: string; success?: boolean };
  } catch {
    result = {};
  }

  if (!response.ok || !result.success) {
    throw new Error(result.error ?? `Contact request failed (${response.status}).`);
  }
}
