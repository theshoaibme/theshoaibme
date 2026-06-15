import { test } from 'node:test';
import assert from 'node:assert/strict';

function normalizeLocalPath(path) {
  return path.trim().replace(/^public\//, '').replace(/^\/+/, '');
}

function resolveImageUrl(path, cdnBase, siteBase = '') {
  const trimmed = path.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const normalized = normalizeLocalPath(trimmed);
  if (cdnBase) return `${cdnBase.replace(/\/+$/, '')}/${normalized}`;

  const base = siteBase.replace(/\/+$/, '');
  return base ? `${base}/${normalized}` : `/${normalized}`;
}

test('resolveImageUrl keeps absolute URLs unchanged', () => {
  const url = 'https://example.com/a.jpg';
  assert.equal(resolveImageUrl(url, 'https://cdn.test'), url);
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
