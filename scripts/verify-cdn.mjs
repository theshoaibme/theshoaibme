#!/usr/bin/env node
/**
 * Smoke-test image CDN endpoints (Cloudinary, R2, or custom base URL).
 */
const CLOUD_NAME = process.env.VITE_CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME ?? 'ddp8owdtu';
const TRANSFORMS = process.env.VITE_CLOUDINARY_TRANSFORMS ?? 'f_auto,q_auto';

function getCdnBaseUrl() {
  if (process.env.CDN_BASE_URL || process.env.VITE_CDN_BASE_URL) {
    return (process.env.CDN_BASE_URL ?? process.env.VITE_CDN_BASE_URL).replace(/\/+$/, '');
  }
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${TRANSFORMS}`;
}

function toAssetPath(key) {
  const base = getCdnBaseUrl();
  if (base.includes('res.cloudinary.com')) {
    return key.replace(/\.[a-z0-9]+$/i, '');
  }
  return key;
}

const CDN_BASE_URL = getCdnBaseUrl();

const REQUIRED_KEYS = [
  'profile.jpg',
  'favicon.ico',
  'projects/meal-sphere.jpg',
  'testimonials/avatar-01.jpg',
];

async function checkAsset(key) {
  const url = `${CDN_BASE_URL}/${toAssetPath(key)}`;
  const response = await fetch(url, { method: 'HEAD' });

  return {
    key,
    url,
    ok: response.ok,
    status: response.status,
    contentType: response.headers.get('content-type') ?? '',
    cacheControl: response.headers.get('cache-control') ?? '',
  };
}

async function main() {
  console.log(`Verifying CDN at ${CDN_BASE_URL}\n`);

  let failed = 0;

  for (const key of REQUIRED_KEYS) {
    const result = await checkAsset(key);
    const pass = result.ok && result.contentType.startsWith('image/');
    console.log(`${pass ? '✓' : '✗'} ${key} → ${result.status} ${result.contentType}`);
    if (!pass) {
      failed += 1;
      console.log(`  URL: ${result.url}`);
    }
  }

  if (failed > 0) {
    console.error(`\n${failed} CDN check(s) failed. Run: pnpm cdn:upload`);
    process.exit(1);
  }

  console.log('\nAll CDN checks passed.');
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
