const RATE_LIMIT = {
  maxRequests: 5,
  windowSeconds: 60,
} as const;

export async function checkRateLimit(request: Request): Promise<{ allowed: boolean; retryAfter?: number }> {
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const windowId = Math.floor(Date.now() / (RATE_LIMIT.windowSeconds * 1000));
  const cacheKey = new Request(`https://rate-limit.internal/${encodeURIComponent(ip)}/${windowId}`);

  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  const currentCount = cached ? Number.parseInt(await cached.text(), 10) : 0;

  if (!Number.isFinite(currentCount) || currentCount >= RATE_LIMIT.maxRequests) {
    return { allowed: false, retryAfter: RATE_LIMIT.windowSeconds };
  }

  await cache.put(cacheKey, new Response(String(currentCount + 1)), {
    expirationTtl: RATE_LIMIT.windowSeconds,
  });

  return { allowed: true };
}
