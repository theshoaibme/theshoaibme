import { resolveRequestOrigin } from './cors';

const ALLOWED_SEC_FETCH_SITES = new Set(['same-origin', 'same-site', 'none']);

export function resolveStrictRequestOrigin(
  request: Request,
  allowedOrigins: string[],
): string | null {
  const origin = request.headers.get('Origin')?.trim();
  if (!origin) {
    return null;
  }

  return resolveRequestOrigin(request, allowedOrigins);
}

export function assertResumeDownloadRequest(
  request: Request,
  allowedOrigins: string[],
): { ok: true; corsOrigin: string } | { ok: false; reason: string } {
  const corsOrigin = resolveStrictRequestOrigin(request, allowedOrigins);
  if (!corsOrigin) {
    return { ok: false, reason: 'Missing or disallowed Origin header.' };
  }

  const contentType = request.headers.get('Content-Type')?.trim().toLowerCase() ?? '';
  if (!contentType.startsWith('application/json')) {
    return { ok: false, reason: 'Content-Type must be application/json.' };
  }

  const secFetchSite = request.headers.get('Sec-Fetch-Site')?.trim().toLowerCase();
  if (secFetchSite && !ALLOWED_SEC_FETCH_SITES.has(secFetchSite)) {
    return { ok: false, reason: 'Cross-site download tracking is not allowed.' };
  }

  const secFetchMode = request.headers.get('Sec-Fetch-Mode')?.trim().toLowerCase();
  if (secFetchMode && secFetchMode !== 'cors') {
    return { ok: false, reason: 'Invalid request mode.' };
  }

  const secFetchDest = request.headers.get('Sec-Fetch-Dest')?.trim().toLowerCase();
  if (secFetchDest && secFetchDest !== 'empty') {
    return { ok: false, reason: 'Invalid request destination.' };
  }

  return { ok: true, corsOrigin };
}

export function isAllowedReferrerOrigin(
  referrer: string | undefined,
  allowedOrigins: string[],
): boolean {
  if (!referrer) {
    return true;
  }

  try {
    return allowedOrigins.includes(new URL(referrer).origin);
  } catch {
    return false;
  }
}
