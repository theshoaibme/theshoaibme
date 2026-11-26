import { getEnv } from '@/utils/env';

export function getTelegramBotToken(): string {
  return getEnv('TELEGRAM_BOT_TOKEN').trim();
}

export function getTelegramChatId(): string {
  return getEnv('TELEGRAM_CHAT_ID').trim();
}

export function isDirectTelegramConfigured(): boolean {
  return Boolean(getTelegramBotToken() && getTelegramChatId());
}

export function getContactApiUrl(): string {
  return '/api/contact';
}

export function isContactApiConfigured(): boolean {
  return true;
}
