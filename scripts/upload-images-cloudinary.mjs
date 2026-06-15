#!/usr/bin/env node
/**
 * Upload public/images/** to Cloudinary.
 * Requires: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */
import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IMAGES_ROOT = path.join(ROOT, 'public', 'images');

const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? process.env.VITE_CLOUDINARY_CLOUD_NAME ?? 'ddp8owdtu';
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

function signParams(params) {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return createHash('sha1').update(sorted + apiSecret).digest('hex');
}

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

async function uploadFile(filePath) {
  const relative = path.relative(IMAGES_ROOT, filePath).split(path.sep).join('/');
  const publicId = relative.replace(/\.[a-z0-9]+$/i, '');
  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    public_id: publicId,
    timestamp: String(timestamp),
  };
  const signature = signParams(params);
  const fileBuffer = await readFile(filePath);
  const blob = new Blob([fileBuffer]);

  const form = new FormData();
  form.append('file', blob, path.basename(filePath));
  form.append('api_key', apiKey);
  form.append('timestamp', params.timestamp);
  form.append('public_id', publicId);
  form.append('signature', signature);
  form.append('overwrite', 'true');

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error?.message ?? `Upload failed for ${relative}`);
  }

  console.log(`✓ ${relative} → ${body.secure_url}`);
}

async function main() {
  if (!apiKey || !apiSecret) {
    console.error('Missing CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET.');
    console.error('Get them from https://console.cloudinary.com/settings/api-keys');
    process.exit(1);
  }

  await stat(IMAGES_ROOT);
  const files = await walkFiles(IMAGES_ROOT);

  console.log(`Uploading ${files.length} image(s) to Cloudinary cloud "${cloudName}"...\n`);

  for (const filePath of files) {
    await uploadFile(filePath);
  }

  console.log('\nCloudinary upload complete.');
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
