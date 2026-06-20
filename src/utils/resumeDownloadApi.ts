import { getResumeDownloadApiUrl } from '@/config/download';

export interface ResumeDownloadTrackPayload {
  source?: string;
  referrer?: string;
  turnstileToken?: string;
  honey_pot?: string;
}

export interface ResumeDownloadTrackResult {
  success: boolean;
  tracked: boolean;
}

export async function trackResumeDownload(
  payload: ResumeDownloadTrackPayload,
): Promise<ResumeDownloadTrackResult | null> {
  const url = getResumeDownloadApiUrl();
  const turnstileToken = payload.turnstileToken?.trim();

  if (!url || !turnstileToken) {
    return null;
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        source: payload.source ?? 'resume-page',
        referrer: payload.referrer ?? (document.referrer || undefined),
        turnstileToken,
        honey_pot: payload.honey_pot,
      }),
    });
  } catch (error) {
    console.warn('Resume download tracking request failed:', error);
    return null;
  }

  let result: ResumeDownloadTrackResult = { success: false, tracked: false };

  try {
    result = (await response.json()) as ResumeDownloadTrackResult;
  } catch {
    result = { success: false, tracked: false };
  }

  if (!response.ok) {
    console.warn('Resume download tracking rejected:', result);
    return null;
  }

  return result;
}

/**
 * Runs after a successful client-side PDF save. Never throws — tracking must not block downloads.
 */
export function notifyResumeDownloadAsync(payload: ResumeDownloadTrackPayload): void {
  void trackResumeDownload(payload).catch((error) => {
    console.warn('Resume download tracking failed:', error);
  });
}
