const DEFAULT_NOTIFICATION_TIMEZONE = 'Asia/Dhaka';
const GEO_LOOKUP_TIMEOUT_MS = 2_000;

const regionDisplayNames = new Intl.DisplayNames(['en'], { type: 'region' });

interface IpWhoResponse {
  success?: boolean;
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
  timezone?: {
    id?: string;
  };
}

export interface VisitorMetadata {
  location: string;
  timezone: string;
}

export function getNotificationTimeZone(): string {
  const configured = (process.env.NOTIFICATION_TIMEZONE ?? '').trim();
  if (!configured) {
    return DEFAULT_NOTIFICATION_TIMEZONE;
  }

  try {
    Intl.DateTimeFormat('en-US', { timeZone: configured });
    return configured;
  } catch {
    return DEFAULT_NOTIFICATION_TIMEZONE;
  }
}

export function getNotificationDateKey(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: getNotificationTimeZone(),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function formatNotificationTimestamp(now = new Date()): string {
  const timeZone = getNotificationTimeZone();
  const formatted = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'shortOffset',
  }).format(now);

  return `${formatted.replace(/\b(am|pm)\b/i, (m) => m.toUpperCase())} (${timeZone})`;
}

function countryCodeToFlag(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) {
    return '';
  }

  return String.fromCodePoint(
    0x1f1e6 + code.charCodeAt(0) - 65,
    0x1f1e6 + code.charCodeAt(1) - 65,
  );
}

function resolveCountryName(countryCodeOrName: string): string {
  const trimmed = countryCodeOrName.trim();
  if (!trimmed) return '';

  if (/^[A-Za-z]{2}$/.test(trimmed)) {
    try {
      return regionDisplayNames.of(trimmed.toUpperCase()) ?? trimmed.toUpperCase();
    } catch {
      return trimmed.toUpperCase();
    }
  }

  return trimmed;
}

function safeDecodeHeader(value: string | null): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';

  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
}

function isPublicIp(ip: string): boolean {
  if (!ip || ip === 'unknown') return false;
  const normalized = ip.trim().toLowerCase();

  if (
    normalized === 'localhost' ||
    normalized === '127.0.0.1' ||
    normalized === '::1' ||
    normalized === '0.0.0.0' ||
    normalized.startsWith('10.') ||
    normalized.startsWith('192.168.') ||
    normalized.startsWith('169.254.') ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe80:')
  ) {
    return false;
  }

  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized)) {
    return false;
  }

  return true;
}

function formatLocationParts(options: {
  city?: string;
  region?: string;
  countryName?: string;
  countryCode?: string;
}): string {
  const parts: string[] = [];
  const city = options.city?.trim() ?? '';
  const region = options.region?.trim() ?? '';
  const countryName = options.countryName?.trim() ?? '';

  if (city) {
    parts.push(city);
  } else if (region) {
    parts.push(region);
  }

  if (countryName && countryName.toLowerCase() !== city.toLowerCase()) {
    parts.push(countryName);
  }

  if (parts.length === 0) {
    return '';
  }

  const flag = options.countryCode ? countryCodeToFlag(options.countryCode) : '';
  return flag ? `${flag} ${parts.join(', ')}` : parts.join(', ');
}

export async function resolveVisitorMetadata(
  request: Request,
  clientIp: string,
  clientTimezone?: unknown,
): Promise<VisitorMetadata> {
  const browserTimezone =
    typeof clientTimezone === 'string' && clientTimezone.trim().length <= 80
      ? clientTimezone.trim()
      : '';

  const headerCity =
    safeDecodeHeader(request.headers.get('x-vercel-ip-city')) ||
    safeDecodeHeader(request.headers.get('cf-ipcity'));
  const headerRegion =
    safeDecodeHeader(request.headers.get('x-vercel-ip-country-region')) ||
    safeDecodeHeader(request.headers.get('cf-region'));
  const headerCountryCode = (
    request.headers.get('x-vercel-ip-country') ??
    request.headers.get('cf-ipcountry') ??
    ''
  )
    .trim()
    .toUpperCase();
  const headerTimezone = safeDecodeHeader(request.headers.get('x-vercel-ip-timezone'));

  const validCountryCode =
    headerCountryCode && headerCountryCode !== 'XX' && headerCountryCode !== 'T1'
      ? headerCountryCode
      : '';

  if (headerCity || validCountryCode) {
    const location = formatLocationParts({
      city: headerCity,
      region: headerRegion,
      countryName: resolveCountryName(validCountryCode),
      countryCode: validCountryCode,
    });

    if (location) {
      return {
        location,
        timezone: headerTimezone || browserTimezone,
      };
    }
  }

  // Fallback Geo-IP lookup when proxy geo headers are absent (e.g. local dev or direct origin)
  try {
    const targetPath = isPublicIp(clientIp) ? encodeURIComponent(clientIp) : '';
    const response = await fetch(`https://ipwho.is/${targetPath}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(GEO_LOOKUP_TIMEOUT_MS),
    });

    if (response.ok) {
      const geo = (await response.json()) as IpWhoResponse;
      if (geo.success) {
        const location = formatLocationParts({
          city: geo.city,
          region: geo.region,
          countryName: geo.country || resolveCountryName(geo.country_code ?? ''),
          countryCode: geo.country_code,
        });

        if (location) {
          return {
            location,
            timezone: geo.timezone?.id?.trim() || headerTimezone || browserTimezone,
          };
        }
      }
    }
  } catch {
    // Ignore fallback timeout/network errors so notifications are never blocked
  }

  return {
    location: browserTimezone ? `Unknown (${browserTimezone})` : 'Unknown',
    timezone: headerTimezone || browserTimezone,
  };
}
