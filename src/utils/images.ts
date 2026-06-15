import { getCdnBaseUrl } from '@/config/cdn';
import { isCloudinaryCdn, toCloudinaryPublicId } from '@/config/cloudinary';

function isAbsoluteUrl(path: string): boolean {
  return /^https?:\/\//i.test(path);
}

function normalizeLocalPath(path: string): string {
  return path.trim().replace(/^public\//, '').replace(/^\/+/, '');
}

function buildCdnAssetUrl(cdnBase: string, normalized: string): string {
  const assetPath = isCloudinaryCdn(cdnBase) ? toCloudinaryPublicId(normalized) : normalized;
  return `${cdnBase}/${assetPath}`;
}

/**
 * Resolves an image path for use in <img src>.
 * - Full URLs (https://...) are returned unchanged.
 * - Local paths use Cloudinary, VITE_CDN_BASE_URL, or same-origin /images/ fallback.
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
    return buildCdnAssetUrl(cdnBase, normalized);
  }

  const siteBase = import.meta.env.BASE_URL.replace(/\/+$/, '');
  return siteBase ? `${siteBase}/${normalized}` : `/${normalized}`;
}
