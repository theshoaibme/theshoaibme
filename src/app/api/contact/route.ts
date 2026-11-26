import { NextResponse } from 'next/server';

interface ContactRequestBody {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  honey_pot?: unknown;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getTelegramCredentials(): { botToken: string; chatId: string } {
  const botToken = (
    process.env.TELEGRAM_BOT_TOKEN ||
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN ||
    process.env.VITE_TELEGRAM_BOT_TOKEN ||
    ''
  ).trim();
  const chatId = (
    process.env.TELEGRAM_CHAT_ID ||
    process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID ||
    process.env.VITE_TELEGRAM_CHAT_ID ||
    ''
  ).trim();

  return { botToken, chatId };
}

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

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { success: false, error: 'All contact fields are required.' },
      { status: 400 },
    );
  }

  const { botToken, chatId } = getTelegramCredentials();
  if (!botToken || !chatId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Telegram is not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in your environment.',
      },
      { status: 503 },
    );
  }

  const text = [
    '<b>New Portfolio Contact Message</b>',
    '',
    `<b>Name:</b> ${escapeHtml(name)}`,
    `<b>Email:</b> ${escapeHtml(email)}`,
    `<b>Subject:</b> ${escapeHtml(subject)}`,
    '',
    '<b>Message:</b>',
    escapeHtml(message),
  ].join('\n');

  const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  });

  if (!telegramResponse.ok) {
    const errorText = await telegramResponse.text().catch(() => '');
    console.error('Telegram API error:', telegramResponse.status, errorText);
    return NextResponse.json(
      { success: false, error: 'Failed to deliver message to Telegram.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true });
}
