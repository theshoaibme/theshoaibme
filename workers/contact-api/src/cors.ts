const LOCAL_DEV_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

const LOCAL_DEV_ORIGIN_PATTERN = /^http:\/\/(localhost|127\.0\.0\.1|\d{1,3}(?:\.\d{1,3}){3}):\d+$/;

export function parseAllowedOrigins(configured?: string): string[] {
  const fromConfig = (configured ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [...new Set([...fromConfig, ...LOCAL_DEV_ORIGINS])];
}

export function resolveRequestOrigin(request: Request, allowedOrigins: string[]): string | null {
  const origin = request.headers.get('Origin')?.trim();
  if (origin) {
    if (allowedOrigins.includes(origin)) {
      return origin;
    }

    if (LOCAL_DEV_ORIGIN_PATTERN.test(origin)) {
      return origin;
    }

    return null;
  }

  const referer = request.headers.get('Referer')?.trim();
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (allowedOrigins.includes(refererOrigin)) {
        return refererOrigin;
      }

      if (LOCAL_DEV_ORIGIN_PATTERN.test(refererOrigin)) {
        return refererOrigin;
      }
    } catch {
      return null;
    }
  }

  return null;
}

export function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}
