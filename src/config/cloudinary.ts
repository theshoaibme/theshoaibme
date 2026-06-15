/** Public Cloudinary cloud name (safe to expose in client URLs). */
export const CLOUDINARY_CLOUD_NAME = 'ddp8owdtu';

/** Default delivery transforms: auto format + quality. */
export const CLOUDINARY_TRANSFORMS = 'f_auto,q_auto';

export function getCloudinaryCloudName(): string {
  return import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim() ?? '';
}

export function getCloudinaryTransforms(): string {
  return import.meta.env.VITE_CLOUDINARY_TRANSFORMS?.trim() || CLOUDINARY_TRANSFORMS;
}

export function buildCloudinaryImageBase(cloudName = getCloudinaryCloudName()): string {
  if (!cloudName) return '';
  return `https://res.cloudinary.com/${cloudName}/image/upload/${getCloudinaryTransforms()}`;
}

export function isCloudinaryCdn(baseUrl: string): boolean {
  return baseUrl.includes('res.cloudinary.com');
}

/** Cloudinary public_id omits the file extension. */
export function toCloudinaryPublicId(normalizedPath: string): string {
  return normalizedPath.replace(/\.[a-z0-9]+$/i, '');
}
