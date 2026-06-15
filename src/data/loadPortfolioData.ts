import type { PortfolioData } from '@/types';
import { DataLoadError } from '@/utils/errors';
import { validatePortfolioData } from '@/utils/validateData';

let cachedData: PortfolioData | null = null;
let inFlightRequest: Promise<PortfolioData> | null = null;

export function getCachedPortfolioData(): PortfolioData | null {
  return cachedData;
}

export function clearPortfolioDataCache(): void {
  cachedData = null;
  inFlightRequest = null;
}

async function requestPortfolioData(): Promise<PortfolioData> {
  let response: Response;

  try {
    response = await fetch(`${import.meta.env.BASE_URL}data.json`);
  } catch (error) {
    throw new DataLoadError(
      'Unable to reach data.json. Check your network connection and try again.',
      error,
    );
  }

  if (!response.ok) {
    throw new DataLoadError(`Failed to load data.json (${response.status} ${response.statusText}).`);
  }

  let json: unknown;

  try {
    json = await response.json();
  } catch (error) {
    throw new DataLoadError('data.json contains invalid JSON.', error);
  }

  return validatePortfolioData(json);
}

export function loadPortfolioData(options: { force?: boolean } = {}): Promise<PortfolioData> {
  const { force = false } = options;

  if (!force && cachedData) {
    return Promise.resolve(cachedData);
  }

  if (!force && inFlightRequest) {
    return inFlightRequest;
  }

  const request = requestPortfolioData()
    .then((data) => {
      cachedData = data;
      return data;
    })
    .finally(() => {
      if (inFlightRequest === request) {
        inFlightRequest = null;
      }
    });

  inFlightRequest = request;
  return request;
}
