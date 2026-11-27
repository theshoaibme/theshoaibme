import { Redis } from '@upstash/redis';
import { getNotificationDateKey } from '@/lib/requestMetadata';

export interface ResumeDownloadStats {
  totalDownloads: number;
  todayDownloads: number;
  uniqueVisitors: number;
  persistent: boolean;
}

const COUNTER_KEYS = {
  total: 'portfolio:resume:downloads:total',
  uniqueVisitors: 'portfolio:resume:downloads:unique_visitors',
  dayPrefix: 'portfolio:resume:downloads:day:',
} as const;

const DAY_KEY_TTL_SECONDS = 60 * 60 * 48;

let cachedRedisClient: Redis | null | undefined;
let fallbackTotalDownloads = 0;
let fallbackDayKey = '';
let fallbackTodayDownloads = 0;
const fallbackUniqueVisitors = new Set<string>();

function getRedisClient(): Redis | null {
  if (cachedRedisClient !== undefined) {
    return cachedRedisClient;
  }

  const url = (
    process.env.UPSTASH_REDIS_REST_URL ??
    process.env.KV_REST_API_URL ??
    ''
  ).trim();
  const token = (
    process.env.UPSTASH_REDIS_REST_TOKEN ??
    process.env.KV_REST_API_TOKEN ??
    ''
  ).trim();

  if (!url || !token) {
    cachedRedisClient = null;
    return null;
  }

  cachedRedisClient = new Redis({ url, token });
  return cachedRedisClient;
}

function recordFallbackDownload(visitorHash: string, dateKey: string): ResumeDownloadStats {
  fallbackTotalDownloads += 1;

  if (fallbackDayKey !== dateKey) {
    fallbackDayKey = dateKey;
    fallbackTodayDownloads = 0;
  }
  fallbackTodayDownloads += 1;

  if (visitorHash && visitorHash !== 'unknown') {
    fallbackUniqueVisitors.add(visitorHash);
  }

  return {
    totalDownloads: fallbackTotalDownloads,
    todayDownloads: fallbackTodayDownloads,
    uniqueVisitors: Math.max(fallbackUniqueVisitors.size, 1),
    persistent: false,
  };
}

/**
 * Atomically increments the resume download counter in Upstash Redis
 * (or falls back cleanly in-memory when Redis credentials are not configured).
 */
export async function recordResumeDownload(visitorHash: string): Promise<ResumeDownloadStats> {
  const dateKey = getNotificationDateKey();
  const redis = getRedisClient();

  if (!redis) {
    return recordFallbackDownload(visitorHash, dateKey);
  }

  try {
    const dayKey = `${COUNTER_KEYS.dayPrefix}${dateKey}`;
    const pipeline = redis.pipeline();
    pipeline.incr(COUNTER_KEYS.total);
    pipeline.incr(dayKey);
    pipeline.expire(dayKey, DAY_KEY_TTL_SECONDS);

    const hasKnownVisitor = Boolean(visitorHash && visitorHash !== 'unknown');
    if (hasKnownVisitor) {
      pipeline.pfadd(COUNTER_KEYS.uniqueVisitors, visitorHash);
    }
    pipeline.pfcount(COUNTER_KEYS.uniqueVisitors);

    const results = await pipeline.exec();
    const totalDownloads = Number(results[0]) || 1;
    const todayDownloads = Number(results[1]) || 1;
    const pfCountIndex = hasKnownVisitor ? 4 : 3;
    const uniqueVisitors = Math.max(Number(results[pfCountIndex]) || 0, 1);

    return {
      totalDownloads,
      todayDownloads,
      uniqueVisitors,
      persistent: true,
    };
  } catch (error) {
    console.error('Upstash Redis counter error, using in-memory fallback:', error);
    return recordFallbackDownload(visitorHash, dateKey);
  }
}

/**
 * Reads the current all-time resume download count without incrementing it.
 */
export async function getResumeDownloadCount(): Promise<{
  totalDownloads: number;
  persistent: boolean;
}> {
  const redis = getRedisClient();

  if (!redis) {
    return { totalDownloads: fallbackTotalDownloads, persistent: false };
  }

  try {
    const raw = await redis.get<number>(COUNTER_KEYS.total);
    return { totalDownloads: Number(raw) || 0, persistent: true };
  } catch (error) {
    console.error('Upstash Redis read error:', error);
    return { totalDownloads: fallbackTotalDownloads, persistent: false };
  }
}
