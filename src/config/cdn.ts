import { buildCloudinaryImageBase, getCloudinaryCloudName } from '@/config/cloudinary';
import { IMAGE_CDN_URL } from '@/config/site';
import { getEnv } from '@/utils/env';

/**
 * Image CDN base URL.
 * Priority: CDN_BASE_URL → Cloudinary (CLOUDINARY_CLOUD_NAME) → same-origin fallback.
 */
export function getCdnBaseUrl(): string {
  const override = getEnv('CDN_BASE_URL').trim().replace(/\/+$/, '');
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
