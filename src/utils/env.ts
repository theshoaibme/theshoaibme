/**
 * Cross-platform environment variable accessor supporting both Next.js and Vite.
 */
export function getEnv(key: string): string {
  // Check process.env (Next.js / Node)
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[key]) return process.env[key]!;
    if (process.env[`NEXT_PUBLIC_${key}`]) return process.env[`NEXT_PUBLIC_${key}`]!;
    if (process.env[`VITE_${key}`]) return process.env[`VITE_${key}`]!;
  }

  // Check import.meta.env (Vite)
  try {
    const metaEnv = (import.meta as unknown as { env?: Record<string, string> })?.env;
    if (metaEnv) {
      if (metaEnv[key]) return metaEnv[key];
      if (metaEnv[`VITE_${key}`]) return metaEnv[`VITE_${key}`];
      if (metaEnv[`NEXT_PUBLIC_${key}`]) return metaEnv[`NEXT_PUBLIC_${key}`];
    }
  } catch {
    // Ignore when import.meta is not defined
  }

  return '';
}

export function isDev(): boolean {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.NODE_ENV === 'development') return true;
  }
  try {
    const metaEnv = (import.meta as unknown as { env?: { DEV?: boolean } })?.env;
    if (metaEnv?.DEV) return true;
  } catch {
    // Ignore
  }
  return false;
}

export function getBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BASE_PATH) {
    return process.env.NEXT_PUBLIC_BASE_PATH;
  }
  try {
    const metaEnv = (import.meta as unknown as { env?: { BASE_URL?: string } })?.env;
    if (metaEnv?.BASE_URL) return metaEnv.BASE_URL;
  } catch {
    // Ignore
  }
  return '';
}
