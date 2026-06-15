/**
 * Optional image CDN base URL (e.g. Cloudflare R2 custom domain).
 * Set VITE_CDN_BASE_URL=https://images.theshoaib.me in .env / GitHub Actions secrets.
 */
export function getCdnBaseUrl(): string {
  return import.meta.env.VITE_CDN_BASE_URL?.trim().replace(/\/+$/, '') ?? '';
}

export function isCdnConfigured(): boolean {
  return Boolean(getCdnBaseUrl());
}
