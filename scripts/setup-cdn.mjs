#!/usr/bin/env node
/**
 * Pre-flight checks for Cloudflare R2 image CDN deployment.
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKER_DIR = path.join(__dirname, '..', 'workers', 'image-cdn');

function runWrangler(args) {
  return execFileSync('npx', ['wrangler', ...args], {
    cwd: WORKER_DIR,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function main() {
  console.log('Portfolio Image CDN — setup checklist\n');

  try {
    const whoami = runWrangler(['whoami']);
    console.log('✓ Wrangler authenticated');
    if (whoami.includes('You are not authenticated')) {
      throw new Error('not authenticated');
    }
  } catch {
    console.error('✗ Run: cd workers/image-cdn && npx wrangler login');
    process.exit(1);
  }

  try {
    runWrangler(['r2', 'bucket', 'list']);
    console.log('✓ R2 is enabled on this account');
  } catch (error) {
    const message = String(error.stderr ?? error.message ?? error);
    if (message.includes('10042')) {
      console.error('✗ R2 is not enabled yet.');
      console.error('  1. Open https://dash.cloudflare.com/?to=/:account/r2/overview');
      console.error('  2. Click "Purchase" / enable R2 (free tier — no card on most accounts)');
      console.error('  3. Re-run: pnpm cdn:setup');
      process.exit(1);
    }
    throw error;
  }

  console.log('\nNext steps:');
  console.log('  pnpm cdn:fetch-images   # refresh screenshots/avatars');
  console.log('  pnpm cdn:sync           # upload to R2');
  console.log('  pnpm cdn:deploy         # deploy Worker');
  console.log('  pnpm cdn:verify         # smoke-test CDN URLs');
  console.log('\nDNS (for images.theshoaib.me):');
  console.log('  Add theshoaib.me to Cloudflare, then attach custom domain on the Worker.');
  console.log('  Until then use: https://portfolio-image-cdn.theshoaibme.workers.dev');
  console.log('\nGitHub secret (production site):');
  console.log('  NEXT_PUBLIC_CDN_BASE_URL=https://images.theshoaib.me');
}

main();
