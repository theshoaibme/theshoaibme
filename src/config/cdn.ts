import { buildCloudinaryImageBase, getCloudinaryCloudName } from '@/config/cloudinary';
import { IMAGE_CDN_URL } from '@/config/site';

/**
 * Image CDN base URL.
 * Priority: VITE_CDN_BASE_URL → Cloudinary (VITE_CLOUDINARY_CLOUD_NAME) → same-origin fallback.
 */
export function getCdnBaseUrl(): string {
  const override = import.meta.env.VITE_CDN_BASE_URL?.trim().replace(/\/+$/, '');
  if (override) {
    return override;
  }

  if (getCloudinaryCloudName()) {
    return buildCloudinaryImageBase();
  }

  return '';
}

export function isCdnConfigured(): boolean {
  return Boolean(getCdnBaseUrl());
}

export { IMAGE_CDN_URL };
