#!/usr/bin/env node
/**
 * Upload public/images/** to Cloudflare R2 (portfolio-images bucket).
 */
import { execFileSync } from 'node:child_process';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IMAGES_ROOT = path.join(ROOT, 'public', 'images');
const WORKER_DIR = path.join(ROOT, 'workers', 'image-cdn');
const BUCKET = 'portfolio-images';

const MIME_TYPES = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

async function walkFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
      continue;
    }
    if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function getContentType(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream';
}

function uploadObject(key, filePath) {
  console.log(`↑ ${key}`);
  execFileSync(
    'npx',
    [
      'wrangler',
      'r2',
      'object',
      'put',
      `${BUCKET}/${key}`,
      '--file',
      filePath,
      '--content-type',
      getContentType(filePath),
      '--remote',
    ],
    { cwd: WORKER_DIR, stdio: 'inherit', env: process.env },
  );
}

async function main() {
  await stat(IMAGES_ROOT);

  const files = await walkFiles(IMAGES_ROOT);
  if (files.length === 0) {
    console.error('No images found in public/images/. Run: pnpm cdn:fetch-images');
    process.exit(1);
  }

  console.log(`Syncing ${files.length} file(s) to R2 bucket "${BUCKET}"...`);

  for (const filePath of files) {
    const key = path.relative(IMAGES_ROOT, filePath).split(path.sep).join('/');
    uploadObject(key, filePath);
  }

  console.log('R2 sync complete.');
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
