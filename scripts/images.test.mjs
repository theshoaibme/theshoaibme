import { test } from 'node:test';
import assert from 'node:assert/strict';

function normalizeLocalPath(path) {
  return path.trim().replace(/^public\//, '').replace(/^\/+/, '');
}

function buildCdnAssetUrl(cdnBase, normalized) {
  const isCloudinary = cdnBase.includes('res.cloudinary.com');
  const assetPath = isCloudinary ? normalized.replace(/\.[a-z0-9]+$/i, '') : normalized;
  return `${cdnBase.replace(/\/+$/, '')}/${assetPath}`;
}

function resolveImageUrl(path, cdnBase, siteBase = '') {
  const trimmed = path.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const normalized = normalizeLocalPath(trimmed);
  if (cdnBase) return buildCdnAssetUrl(cdnBase, normalized);

  const base = siteBase.replace(/\/+$/, '');
  return base ? `${base}/${normalized}` : `/${normalized}`;
}

test('resolveImageUrl keeps absolute URLs unchanged', () => {
  const url = 'https://example.com/a.jpg';
  assert.equal(resolveImageUrl(url, 'https://cdn.test'), url);
});

test('resolveImageUrl maps local paths to Cloudinary with auto transforms', () => {
  const base = 'https://res.cloudinary.com/ddp8owdtu/image/upload/f_auto,q_auto';
  assert.equal(
    resolveImageUrl('/images/profile.jpg', base),
    'https://res.cloudinary.com/ddp8owdtu/image/upload/f_auto,q_auto/images/profile',
  );
});

test('resolveImageUrl maps local paths to CDN base', () => {
  assert.equal(
    resolveImageUrl('/images/profile.jpg', 'https://images.theshoaib.me'),
    'https://images.theshoaib.me/images/profile.jpg',
  );
  assert.equal(
    resolveImageUrl('public/images/favicon.ico', 'https://images.theshoaib.me'),
    'https://images.theshoaib.me/images/favicon.ico',
  );
});

test('resolveImageUrl falls back to same-origin without CDN', () => {
  assert.equal(resolveImageUrl('/images/profile.jpg', ''), '/images/profile.jpg');
});

test('resolveImageUrl handles empty input', () => {
  assert.equal(resolveImageUrl('  ', 'https://cdn.test'), '');
});
