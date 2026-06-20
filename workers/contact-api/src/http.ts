import { corsHeaders } from './cors';

export function json(
  data: Record<string, unknown>,
  status: number,
  corsOrigin: string,
  extraHeaders: Record<string, string> = {},
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...corsHeaders(corsOrigin),
      ...extraHeaders,
    },
  });
}

export function rejectCors(status = 403): Response {
  return new Response(JSON.stringify({ error: 'Origin not allowed.' }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
