import type { PortfolioData } from '@/types';
import { validatePortfolioData } from '@/utils/validateData';
import { getBaseUrl } from '@/utils/env';
import { ApiError, type RequestOptions } from './types';
import rawDataJson from '../../../public/data.json';

let cachedPortfolioData: PortfolioData | null = null;
let inFlightRequest: Promise<PortfolioData> | null = null;

function getDataUrl(): string {
  const baseUrl = getBaseUrl() || '/';
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
  // If executing on the server (Next.js SSR/SSG/Build), load from local data.json directly
  if (typeof window === 'undefined') {
    return validatePortfolioData(rawDataJson);
  }

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
    throw new DOMException('The operation was aborted.', 'AbortError');
  }

  if (!force && cachedPortfolioData) {
    return { data: cachedPortfolioData, cached: true };
  }

  if (inFlightRequest) {
    const request = requestPortfolioData()
      .then((data) => {
        cachedPortfolioData = data;
        return data;
      })
      .finally(() => {
        inFlightRequest = null;
      });

    inFlightRequest = request;
  } else {
    inFlightRequest = requestPortfolioData()
      .then((data) => {
        cachedPortfolioData = data;
        return data;
      })
      .finally(() => {
        inFlightRequest = null;
      });
  }

  let data: PortfolioData;
  if (signal) {
    data = await new Promise<PortfolioData>((resolve, reject) => {
      const abortHandler = () => {
        reject(new DOMException('The operation was aborted.', 'AbortError'));
      };

      signal.addEventListener('abort', abortHandler, { once: true });

      inFlightRequest!
        .then((result) => {
          signal.removeEventListener('abort', abortHandler);
          resolve(result);
        })
        .catch((err) => {
          signal.removeEventListener('abort', abortHandler);
          reject(err);
        });
    });
  } else {
    data = await inFlightRequest;
  }

  return { data, cached: Boolean(cachedPortfolioData && !force) };
}
