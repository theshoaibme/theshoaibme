import { getErrorMessage } from '@/utils/errors';

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  turnstileToken: string;
  honey_pot?: string;
}

function normalizeApiUrl(apiUrl: string): string {
  return apiUrl.trim().replace(/\/+$/, '');
}

function getNetworkErrorMessage(error: unknown): string {
  const message = getErrorMessage(error, '');

  if (error instanceof TypeError || /failed to fetch|networkerror|load failed/i.test(message)) {
    return 'Unable to reach the contact server. Check your connection, then try again.';
  }

  return message || 'Unable to reach the contact server. Please try again later.';
}

export async function sendContactViaApi(apiUrl: string, payload: ContactPayload): Promise<void> {
  const url = normalizeApiUrl(apiUrl);

  if (!url) {
    throw new Error('Contact API is not configured.');
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error(getNetworkErrorMessage(error));
  }

  let result: { error?: string; success?: boolean } = {};

  try {
    result = (await response.json()) as { error?: string; success?: boolean };
  } catch {
    result = {};
  }

  if (!response.ok) {
    throw new Error(result.error ?? `Contact request failed (${response.status}).`);
  }

  if (!result.success) {
    throw new Error(result.error ?? 'Contact request failed.');
  }
}
