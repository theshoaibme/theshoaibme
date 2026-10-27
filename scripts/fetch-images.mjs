#!/usr/bin/env node
/**
 * Mirror external portfolio images into public/images/ for CDN upload.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IMAGES_ROOT = path.join(ROOT, 'public', 'images');
const UA = 'Mozilla/5.0 (compatible; PortfolioCDN/1.0)';

const PROJECTS = [
  { slug: 'meal-sphere', url: 'https://meal-sphere.vercel.app' },
  { slug: 'daffodil-intelligence', url: 'https://daffodil-intelligence.vercel.app' },
  { slug: 'orthopedicsurgeon', url: 'https://orthopedicsurgeonrahman.com/' },
  { slug: 'sobujbd', url: 'https://app3.csetech.diu.edu.bd/' },
  { slug: 'app-pro', url: 'https://github.com/theshoaibme/app-pro' },
  { slug: 'pregnify', url: 'https://github.com/theshoaibme/Pregnify' },
  { slug: 'super-shop-management', url: 'https://github.com/theshoaibme/Super-Shop-Management' },
];

const TESTIMONIAL_AVATARS = [
  'men/32',
  'women/44',
  'men/58',
  'women/62',
  'men/67',
  'men/22',
  'women/47',
  'women/38',
  'men/41',
  'women/19',
  'men/49',
  'women/52',
  'women/56',
  'men/36',
  'women/65',
  'men/27',
  'women/71',
  'men/73',
];

async function download(url, dest) {
  const response = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!response.ok) {
    throw new Error(`Failed ${url}: HTTP ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(dest, buffer);
  console.log(`✓ ${path.relative(ROOT, dest)} (${buffer.length} bytes)`);
}

async function main() {
  await mkdir(path.join(IMAGES_ROOT, 'projects'), { recursive: true });
  await mkdir(path.join(IMAGES_ROOT, 'testimonials'), { recursive: true });

  for (const project of PROJECTS) {
    const thumbUrl = `https://image.thum.io/get/width/1200/${project.url}`;
    await download(thumbUrl, path.join(IMAGES_ROOT, 'projects', `${project.slug}.jpg`));
  }

  for (const [index, avatar] of TESTIMONIAL_AVATARS.entries()) {
    const avatarUrl = `https://randomuser.me/api/portraits/${avatar}.jpg`;
    const fileName = `avatar-${String(index + 1).padStart(2, '0')}.jpg`;
    await download(avatarUrl, path.join(IMAGES_ROOT, 'testimonials', fileName));
  }

  console.log('Image fetch complete.');
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
