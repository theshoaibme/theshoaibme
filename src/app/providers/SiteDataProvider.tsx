import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { PortfolioData } from '@/types';
import { DataLoadError, getErrorMessage } from '@/utils/errors';
import { validatePortfolioData } from '@/utils/validateData';

interface SiteDataContextValue {
  data: PortfolioData | null;
  error: string | null;
  loading: boolean;
  retry: () => void;
}

const SiteDataContext = createContext<SiteDataContextValue | null>(null);

async function fetchPortfolioData(): Promise<PortfolioData> {
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

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  const loadData = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      const portfolioData = await fetchPortfolioData();

      if (signal.aborted) return;

      setData(portfolioData);
    } catch (err) {
      if (signal.aborted) return;

      const message = getErrorMessage(err, 'Failed to load portfolio data.');
      console.error('Error loading data:', err);
      setData(null);
      setError(message);
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadData(controller.signal);

    return () => controller.abort();
  }, [attempt, loadData]);

  const retry = useCallback(() => {
    setAttempt((current) => current + 1);
  }, []);

  const value = useMemo(
    () => ({
      data,
      error,
      loading,
      retry,
    }),
    [data, error, loading, retry],
  );

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export function useSiteDataContext() {
  const context = useContext(SiteDataContext);

  if (!context) {
    throw new Error('useSiteDataContext must be used within SiteDataProvider.');
  }

  return context;
}
