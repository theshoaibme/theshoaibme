import { getBaseUrl } from '@/utils/env';

export function isHomePath(pathname: string): boolean {
  const base = getBaseUrl().replace(/\/$/, '');
  if (!base || base === '/') {
    return pathname === '/' || pathname === '';
  }

  return pathname === base || pathname === `${base}/`;
}
