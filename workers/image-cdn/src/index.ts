interface Env {
  IMAGES: R2Bucket;
  ALLOWED_ORIGINS: string;
}

const MIME_TYPES: Record<string, string> = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function getContentType(key: string): string {
  const extension = key.slice(key.lastIndexOf('.')).toLowerCase();
  return MIME_TYPES[extension] ?? 'application/octet-stream';
}

function isValidKey(key: string): boolean {
  if (!key || key.includes('..') || key.startsWith('/')) {
    return false;
  }
  return /^[A-Za-z0-9/_.-]+$/.test(key);
}

function corsHeaders(origin: string | null, allowedOrigins: string[]): HeadersInit {
  if (!origin || !allowedOrigins.includes(origin)) {
    return {};
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowedOrigins = env.ALLOWED_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request.headers.get('Origin'), allowedOrigins),
      });
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405 });
    }

    const url = new URL(request.url);
    const key = decodeURIComponent(url.pathname.replace(/^\/+/, ''));

    if (!isValidKey(key)) {
      return new Response('Not found', { status: 404 });
    }

    const object = await env.IMAGES.get(key);
    if (!object) {
      return new Response('Not found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('Content-Type', headers.get('Content-Type') ?? getContentType(key));
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('X-Content-Type-Options', 'nosniff');

    const cors = corsHeaders(request.headers.get('Origin'), allowedOrigins);
    for (const [name, value] of Object.entries(cors)) {
      headers.set(name, value);
    }

    if (request.method === 'HEAD') {
      return new Response(null, { status: 200, headers });
    }

    return new Response(object.body, { headers });
  },
};
