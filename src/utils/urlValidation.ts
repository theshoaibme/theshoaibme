const BLOCKED_SCHEMES = ['javascript:', 'data:', 'vbscript:'];

export function isSafeNavLink(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('#')) {
    return /^#[A-Za-z0-9_-]+$/.test(trimmed);
  }
  if (trimmed.startsWith('/')) {
    return /^\/[A-Za-z0-9/_-]*$/.test(trimmed);
  }
  return isSafeExternalUrl(trimmed);
}

export function isSafeExternalUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;

  try {
    const parsed = new URL(trimmed);
    if (BLOCKED_SCHEMES.includes(parsed.protocol.toLowerCase())) {
      return false;
    }
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function isSafeImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/')) {
    return /^\/[A-Za-z0-9/_.-]+$/.test(trimmed);
  }
  if (trimmed.startsWith('public/')) {
    return /^public\/[A-Za-z0-9/_.-]+$/.test(trimmed);
  }
  return isSafeExternalUrl(trimmed);
}
