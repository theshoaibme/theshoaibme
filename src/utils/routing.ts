export function isHomePath(pathname: string): boolean {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (!base || base === '/') {
    return pathname === '/' || pathname === '';
  }

  return pathname === base || pathname === `${base}/`;
}
