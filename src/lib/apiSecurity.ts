import { createHash } from 'node:crypto';

interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Extracts the best-effort client IP from standard proxy/Vercel headers.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  return 'unknown';
}

/**
 * Returns a short non-reversible hash prefix for privacy-safe logging/notifications.
 */
export function hashClientIp(ip: string): string {
  if (!ip || ip === 'unknown') return 'unknown';
  return createHash('sha256').update(ip).digest('hex').slice(0, 10);
}

/**
 * In-memory sliding-window rate limiter per key (effective within warm serverless instances).
 */
export function isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  const entry = rateLimitStore.get(key);

  if (!entry) {
    rateLimitStore.set(key, { timestamps: [now] });
    return false;
  }

  const recent = entry.timestamps.filter((ts) => ts > windowStart);
  if (recent.length >= maxRequests) {
    entry.timestamps = recent;
    return true;
  }

  recent.push(now);
  entry.timestamps = recent;

  // Prevent unbounded growth on long-lived instances
  if (rateLimitStore.size > 1000) {
    for (const [storedKey, storedEntry] of rateLimitStore.entries()) {
      if (storedEntry.timestamps.every((ts) => ts <= windowStart)) {
        rateLimitStore.delete(storedKey);
      }
    }
  }

  return false;
}

/**
 * Verifies a Cloudflare Turnstile token if TURNSTILE_SECRET_KEY is configured.
 * Returns true when Turnstile is not configured on the server.
 */
export async function verifyTurnstileIfConfigured(
  token: unknown,
  remoteIp: string,
): Promise<boolean> {
  const secretKey = (process.env.TURNSTILE_SECRET_KEY ?? '').trim();
  if (!secretKey) {
    return true;
  }

  const tokenStr = typeof token === 'string' ? token.trim() : '';
  if (!tokenStr) {
    return false;
  }

  try {
    const formData = new URLSearchParams();
    formData.set('secret', secretKey);
    formData.set('response', tokenStr);
    if (remoteIp && remoteIp !== 'unknown') {
      formData.set('remoteip', remoteIp);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      return false;
    }

    const result = (await response.json()) as { success?: boolean };
    return Boolean(result.success);
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}
