import { getEnv, isDev } from '@/utils/env';

export function getContactApiUrl(): string {
  const configured = getEnv('CONTACT_API_URL').trim();

  // Dev proxy → Cloudflare Worker.
  if (isDev()) {
    return '/api/contact';
  }

  return configured;
}

export function isContactApiConfigured(): boolean {
  if (isDev()) {
    return true;
  }

  return Boolean(getContactApiUrl());
}
