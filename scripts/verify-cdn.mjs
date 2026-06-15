#!/usr/bin/env node
/**
 * Smoke-test image CDN endpoints (R2 + Worker).
 * Usage: CDN_BASE_URL=https://images.theshoaib.me node scripts/verify-cdn.mjs
 */
const CDN_BASE_URL = (process.env.CDN_BASE_URL ?? process.env.VITE_CDN_BASE_URL ?? 'https://images.theshoaib.me')
  .replace(/\/+$/, '');

const REQUIRED_KEYS = [
  'profile.jpg',
  'favicon.ico',
  'projects/meal-sphere.jpg',
  'testimonials/avatar-01.jpg',
];

const OPTIONAL_ORIGIN = process.env.ORIGIN ?? 'https://theshoaib.me';

async function checkAsset(key) {
  const url = `${CDN_BASE_URL}/${key}`;
  const response = await fetch(url, {
    method: 'HEAD',
    headers: { Origin: OPTIONAL_ORIGIN },
  });

  const cacheControl = response.headers.get('cache-control') ?? '';
  const contentType = response.headers.get('content-type') ?? '';

  return {
    key,
    url,
    ok: response.ok,
    status: response.status,
    contentType,
    cacheControl,
    cors: response.headers.get('access-control-allow-origin'),
  };
}

async function main() {
  console.log(`Verifying CDN at ${CDN_BASE_URL}\n`);

  let failed = 0;

  for (const key of REQUIRED_KEYS) {
    const result = await checkAsset(key);
    const pass = result.ok && result.contentType.startsWith('image/');
    const icon = pass ? '✓' : '✗';
    console.log(`${icon} ${key} → ${result.status} ${result.contentType}`);

    if (!pass) {
      failed += 1;
      console.log(`  URL: ${result.url}`);
    } else if (!result.cacheControl.includes('max-age')) {
      console.log(`  warn: missing long-lived cache header (${result.cacheControl || 'none'})`);
    }
  }

  if (failed > 0) {
    console.error(`\n${failed} CDN check(s) failed.`);
    process.exit(1);
  }

  console.log('\nAll CDN checks passed.');
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
