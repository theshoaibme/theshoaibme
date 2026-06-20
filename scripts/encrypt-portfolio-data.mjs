import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadLocalEnv } from './load-local-env.mjs';
import {
  encryptPortfolioJson,
  resolvePortfolioDataKey,
} from './portfolio-data-crypto.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
loadLocalEnv(root);
const sourcePath = resolve(root, 'data/portfolio.json');
const outputPath = resolve(root, 'public/data.enc');

const jsonText = readFileSync(sourcePath, 'utf8');

try {
  JSON.parse(jsonText);
} catch {
  throw new Error('data/portfolio.json contains invalid JSON.');
}

const key = resolvePortfolioDataKey();
const encrypted = encryptPortfolioJson(jsonText, key);

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, encrypted);

console.log(`Encrypted portfolio data → public/data.enc (${encrypted.length} bytes)`);
