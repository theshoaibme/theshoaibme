import { DataLoadError } from '@/utils/errors';

export const PORTFOLIO_DATA_ASSET = 'data.enc';
const IV_BYTES = 12;
const TAG_BYTES = 16;
const KEY_BYTES = 32;

function decodeBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function importDecryptionKey(): Promise<CryptoKey> {
  const rawKey = import.meta.env.VITE_DATA_ENCRYPTION_KEY?.trim() ?? '';

  if (!rawKey) {
    throw new DataLoadError(
      'Portfolio data decryption key is not configured. Set VITE_DATA_ENCRYPTION_KEY in your environment.',
    );
  }

  let keyBytes: Uint8Array;

  try {
    keyBytes = decodeBase64(rawKey);
  } catch {
    throw new DataLoadError('VITE_DATA_ENCRYPTION_KEY is not valid base64.');
  }

  if (keyBytes.length !== KEY_BYTES) {
    throw new DataLoadError(
      `VITE_DATA_ENCRYPTION_KEY must decode to ${KEY_BYTES} bytes. Generate one with: openssl rand -base64 32`,
    );
  }

  return crypto.subtle.importKey(
    'raw',
    keyBytes.buffer as ArrayBuffer,
    { name: 'AES-GCM' },
    false,
    ['decrypt'],
  );
}

export async function decryptPortfolioPayload(payload: ArrayBuffer): Promise<unknown> {
  const bytes = new Uint8Array(payload);
  const minimumLength = IV_BYTES + TAG_BYTES + 1;

  if (bytes.length < minimumLength) {
    throw new DataLoadError('Encrypted portfolio payload is too short or corrupted.');
  }

  const iv = bytes.slice(0, IV_BYTES);
  const tag = bytes.slice(IV_BYTES, IV_BYTES + TAG_BYTES);
  const ciphertext = bytes.slice(IV_BYTES + TAG_BYTES);
  const sealed = new Uint8Array(ciphertext.length + tag.length);

  sealed.set(ciphertext);
  sealed.set(tag, ciphertext.length);

  const key = await importDecryptionKey();

  let decrypted: ArrayBuffer;

  try {
    decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, sealed);
  } catch {
    throw new DataLoadError(
      'Unable to decrypt portfolio data. Check VITE_DATA_ENCRYPTION_KEY matches the build encryption key.',
    );
  }

  const jsonText = new TextDecoder().decode(decrypted);

  try {
    return JSON.parse(jsonText) as unknown;
  } catch {
    throw new DataLoadError('Decrypted portfolio data is not valid JSON.');
  }
}
