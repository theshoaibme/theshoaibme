#!/usr/bin/env node
/**
 * Mirror external portfolio images into public/images/ for CDN upload.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'public', 'data.json');
const IMAGES_ROOT = path.join(ROOT, 'public', 'images');
const UA = 'Mozilla/5.0 (compatible; PortfolioCDN/1.0)';

async function loadProjects() {
  const raw = await readFile(DATA_PATH, 'utf8');
  const data = JSON.parse(raw);
  const projects = Array.isArray(data.projects) ? data.projects : [];

  return projects
    .filter((project) => typeof project.image === 'string' && project.image.startsWith('/images/projects/'))
    .map((project) => ({
      name: project.name,
      dest: path.join(ROOT, 'public', project.image.replace(/^\/+/, '')),
      url: project.live_preview || project.repository,
    }))
    .filter((project) => Boolean(project.url));
}

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

  const projects = await loadProjects();

  for (const project of projects) {
    const thumbUrl = `https://image.thum.io/get/width/1200/noanimate/${project.url}`;
    await download(thumbUrl, project.dest);
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
