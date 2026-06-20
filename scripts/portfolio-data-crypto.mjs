import { createCipheriv, randomBytes } from 'node:crypto';

export const PORTFOLIO_DATA_IV_BYTES = 12;
export const PORTFOLIO_DATA_TAG_BYTES = 16;
export const PORTFOLIO_DATA_KEY_BYTES = 32;

export function resolvePortfolioDataKey(env = process.env) {
  const raw = env.VITE_DATA_ENCRYPTION_KEY?.trim() ?? env.DATA_ENCRYPTION_KEY?.trim() ?? '';

  if (!raw) {
    throw new Error(
      'Missing VITE_DATA_ENCRYPTION_KEY. Generate one with: openssl rand -base64 32',
    );
  }

  const key = Buffer.from(raw, 'base64');

  if (key.length !== PORTFOLIO_DATA_KEY_BYTES) {
    throw new Error(
      `VITE_DATA_ENCRYPTION_KEY must decode to ${PORTFOLIO_DATA_KEY_BYTES} bytes (use: openssl rand -base64 32).`,
    );
  }

  return key;
}

export function encryptPortfolioJson(jsonText, key) {
  const iv = randomBytes(PORTFOLIO_DATA_IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(jsonText, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, ciphertext]);
}
