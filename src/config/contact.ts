export function getContactApiUrl(): string {
  const configured = import.meta.env.VITE_CONTACT_API_URL?.trim() ?? '';

  // Vite dev/preview proxy (vite.config.ts) → Cloudflare Worker.
  if (import.meta.env.DEV) {
    return '/api/contact';
  }

  return configured;
}

export function isContactApiConfigured(): boolean {
  if (import.meta.env.DEV) {
    return true;
  }

  return Boolean(getContactApiUrl());
}
