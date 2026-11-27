/**
 * Public (client-safe) environment variables.
 *
 * Next.js only inlines `process.env.NEXT_PUBLIC_*` into client bundles when each
 * variable is referenced statically, so every key is listed explicitly here.
 */
const PUBLIC_ENV = {
  BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH,
  CDN_BASE_URL: process.env.NEXT_PUBLIC_CDN_BASE_URL,
  CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_TRANSFORMS: process.env.NEXT_PUBLIC_CLOUDINARY_TRANSFORMS,
  RESUME_DOWNLOAD_API_URL: process.env.NEXT_PUBLIC_RESUME_DOWNLOAD_API_URL,
} as const;

export type PublicEnvKey = keyof typeof PUBLIC_ENV;

export function getEnv(key: PublicEnvKey): string {
  return (PUBLIC_ENV[key] ?? '').trim();
}

export function getBaseUrl(): string {
  return getEnv('BASE_PATH');
}
