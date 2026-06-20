import type { PortfolioData } from '@/types';
import { DataLoadError } from '@/utils/errors';
import { decryptPortfolioPayload, PORTFOLIO_DATA_ASSET } from '@/utils/portfolioDataCrypto';
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
    response = await fetch(`${import.meta.env.BASE_URL}${PORTFOLIO_DATA_ASSET}`, {
      cache: 'no-store',
      headers: {
        Accept: 'application/octet-stream',
      },
    });
  } catch (error) {
    throw new DataLoadError(
      'Unable to reach encrypted portfolio data. Check your network connection and try again.',
      error,
    );
  }

  if (!response.ok) {
    throw new DataLoadError(
      `Failed to load encrypted portfolio data (${response.status} ${response.statusText}).`,
    );
  }

  let payload: ArrayBuffer;

  try {
    payload = await response.arrayBuffer();
  } catch (error) {
    throw new DataLoadError('Encrypted portfolio payload could not be read.', error);
  }

  let json: unknown;

  try {
    json = await decryptPortfolioPayload(payload);
  } catch (error) {
    if (error instanceof DataLoadError) {
      throw error;
    }

    throw new DataLoadError('Unable to decrypt portfolio data.', error);
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
