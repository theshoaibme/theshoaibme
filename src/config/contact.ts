export function getContactApiUrl(): string {
  return import.meta.env.VITE_CONTACT_API_URL?.trim() ?? '';
}

export function isContactApiConfigured(): boolean {
  return Boolean(getContactApiUrl());
}
