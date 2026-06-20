const DEFAULT_RATE_LIMIT = {
  maxRequests: 5,
  windowSeconds: 60,
} as const;

interface RateLimitOptions {
  scope?: string;
  maxRequests?: number;
  windowSeconds?: number;
}

export async function checkRateLimit(
  request: Request,
  options: RateLimitOptions = {},
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const maxRequests = options.maxRequests ?? DEFAULT_RATE_LIMIT.maxRequests;
  const windowSeconds = options.windowSeconds ?? DEFAULT_RATE_LIMIT.windowSeconds;
  const scope = options.scope ?? 'contact';
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const windowId = Math.floor(Date.now() / (windowSeconds * 1000));
  const cacheKey = new Request(
    `https://rate-limit.internal/${encodeURIComponent(scope)}/${encodeURIComponent(ip)}/${windowId}`,
  );

  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  const currentCount = cached ? Number.parseInt(await cached.text(), 10) : 0;

  if (!Number.isFinite(currentCount) || currentCount >= maxRequests) {
    return { allowed: false, retryAfter: windowSeconds };
  }

  await cache.put(
    cacheKey,
    new Response(String(currentCount + 1), {
      headers: { 'Cache-Control': `max-age=${windowSeconds}` },
    }),
  );

  return { allowed: true };
}
