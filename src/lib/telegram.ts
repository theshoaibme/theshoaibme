export interface TelegramCredentials {
  botToken: string;
  chatId: string;
}

export interface TelegramSendResult {
  ok: boolean;
  status: number;
  error?: string;
}

/**
 * Escapes HTML special characters for Telegram HTML parse_mode.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Reads server-only Telegram credentials from environment variables.
 */
export function getTelegramCredentials(): TelegramCredentials {
  const botToken = (process.env.TELEGRAM_BOT_TOKEN ?? '').trim();
  const chatId = (process.env.TELEGRAM_CHAT_ID ?? '').trim();
  return { botToken, chatId };
}

/**
 * Sends an HTML-formatted message to the configured Telegram chat.
 */
export async function sendTelegramMessage(htmlText: string): Promise<TelegramSendResult> {
  const { botToken, chatId } = getTelegramCredentials();

  if (!botToken || !chatId) {
    return {
      ok: false,
      status: 503,
      error: 'Telegram is not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in your environment.',
    };
  }

  let response: Response;
  try {
    response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: htmlText,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
  } catch (error) {
    console.error('Telegram network error:', error);
    return {
      ok: false,
      status: 502,
      error: 'Unable to reach Telegram API.',
    };
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    console.error('Telegram API error:', response.status, errorText);
    return {
      ok: false,
      status: 502,
      error: 'Failed to deliver message to Telegram.',
    };
  }

  return { ok: true, status: 200 };
}
