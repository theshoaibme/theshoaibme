export async function verifyTurnstile(
  secret: string,
  token: string,
  remoteIp: string | null,
): Promise<boolean> {
  const body = new URLSearchParams({
    secret,
    response: token,
  });

  if (remoteIp) {
    body.set('remoteip', remoteIp);
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    console.error('Turnstile siteverify HTTP error:', response.status);
    return false;
  }

  const result = (await response.json()) as { success?: boolean; 'error-codes'?: string[] };

  if (!result.success) {
    console.error('Turnstile verification failed:', result['error-codes']?.join(', ') ?? 'unknown');
  }

  return Boolean(result.success);
}
