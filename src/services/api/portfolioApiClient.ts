import type { PortfolioData } from '@/types';
import { validatePortfolioData } from '@/utils/validateData';
import { ApiError, type RequestOptions } from './types';

let cachedPortfolioData: PortfolioData | null = null;
let inFlightRequest: Promise<PortfolioData> | null = null;

function getDataUrl(): string {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${cleanBase}data.json`;
}

export function getCachedPortfolioData(): PortfolioData | null {
  return cachedPortfolioData;
}

export function clearPortfolioDataCache(): void {
  cachedPortfolioData = null;
  inFlightRequest = null;
}

async function requestPortfolioData(): Promise<PortfolioData> {
  const url = getDataUrl();
  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });
  } catch (error) {
    throw new ApiError(
      'Unable to reach portfolio data source. Check your network connection and try again.',
      503,
      error,
    );
  }

  if (!response.ok) {
    throw new ApiError(
      `Failed to load portfolio data (${response.status} ${response.statusText}).`,
      response.status,
    );
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch (error) {
    throw new ApiError('Portfolio data source contains invalid JSON.', 422, error);
  }

  try {
    return validatePortfolioData(json);
  } catch (error) {
    throw new ApiError('Portfolio data failed schema validation.', 422, error);
  }
}

export async function fetchRawPortfolioData(
  options: RequestOptions = {},
): Promise<{ data: PortfolioData; cached: boolean }> {
  const { force = false, signal } = options;

  if (signal?.aborted) {
    throw signal.reason ?? new DOMException('The operation was aborted.', 'AbortError');
  }

  if (!force && cachedPortfolioData) {
    return { data: cachedPortfolioData, cached: true };
  }

  if (!inFlightRequest || force) {
    const request = requestPortfolioData()
      .then((data) => {
        cachedPortfolioData = data;
        return data;
      })
      .catch((err) => {
        if (inFlightRequest === request) {
          inFlightRequest = null;
        }
        throw err;
      })
      .finally(() => {
        if (inFlightRequest === request) {
          inFlightRequest = null;
        }
      });

    inFlightRequest = request;
  }

  const currentRequest = inFlightRequest;

  let data: PortfolioData;
  if (signal) {
    data = await new Promise<PortfolioData>((resolve, reject) => {
      const onAbort = () => {
        signal.removeEventListener('abort', onAbort);
        reject(signal.reason ?? new DOMException('The operation was aborted.', 'AbortError'));
      };

      if (signal.aborted) {
        onAbort();
        return;
      }

      signal.addEventListener('abort', onAbort, { once: true });

      currentRequest
        .then((result) => {
          signal.removeEventListener('abort', onAbort);
          resolve(result);
        })
        .catch((err) => {
          signal.removeEventListener('abort', onAbort);
          reject(err);
        });
    });
  } else {
    data = await currentRequest;
  }

  return { data, cached: Boolean(cachedPortfolioData && !force) };
}

