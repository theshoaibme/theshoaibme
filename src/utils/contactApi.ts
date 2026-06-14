import { getErrorMessage } from '@/utils/errors';

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  turnstileToken: string;
}

export async function sendContactViaApi(apiUrl: string, payload: ContactPayload): Promise<void> {
  let response: Response;

  try {
    response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error(
      getErrorMessage(error, 'Unable to reach the contact server. Please try again later.'),
    );
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
}
