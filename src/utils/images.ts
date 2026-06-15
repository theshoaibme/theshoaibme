import { getCdnBaseUrl } from '@/config/cdn';

function isAbsoluteUrl(path: string): boolean {
  return /^https?:\/\//i.test(path);
}

function normalizeLocalPath(path: string): string {
  return path.trim().replace(/^public\//, '').replace(/^\/+/, '');
}

/**
 * Resolves an image path for use in <img src>.
 * - Full URLs (https://...) are returned unchanged.
 * - Local paths (/images/..., public/images/...) use CDN when VITE_CDN_BASE_URL is set,
 *   otherwise same-origin GitHub Pages path.
 */
export function resolveImageUrl(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return '';

  if (isAbsoluteUrl(trimmed)) {
    return trimmed;
  }

  const normalized = normalizeLocalPath(trimmed);
  const cdnBase = getCdnBaseUrl();

  if (cdnBase) {
    return `${cdnBase}/${normalized}`;
  }

  const siteBase = import.meta.env.BASE_URL.replace(/\/+$/, '');
  return siteBase ? `${siteBase}/${normalized}` : `/${normalized}`;
}
