import { IMAGE_CDN_URL } from '@/config/site';

/**
 * Image CDN base URL (Cloudflare R2 + Worker).
 * Set VITE_CDN_BASE_URL to override. Unset = same-origin /images/ fallback.
 */
export function getCdnBaseUrl(): string {
  return import.meta.env.VITE_CDN_BASE_URL?.trim().replace(/\/+$/, '') ?? '';
}

export function isCdnConfigured(): boolean {
  return Boolean(getCdnBaseUrl());
}

/** Canonical CDN URL used in setup docs and CI verify scripts. */
export { IMAGE_CDN_URL };
