import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { PortfolioData } from '@/types';
import {
  clearPortfolioDataCache,
  getCachedPortfolioData,
  loadPortfolioData,
} from '@/data/loadPortfolioData';
import { getErrorMessage } from '@/utils/errors';

interface SiteDataContextValue {
  data: PortfolioData | null;
  error: string | null;
  loading: boolean;
  retry: () => void;
}

const SiteDataContext = createContext<SiteDataContextValue | null>(null);

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const initialCache = getCachedPortfolioData();
  const [data, setData] = useState<PortfolioData | null>(initialCache);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initialCache);
  const [attempt, setAttempt] = useState(0);

  const loadData = useCallback(async (signal: AbortSignal, force: boolean) => {
    if (!getCachedPortfolioData()) {
      setLoading(true);
    }

    setError(null);

    try {
      const portfolioData = await loadPortfolioData({ force });

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
    void loadData(controller.signal, attempt > 0);

    return () => controller.abort();
  }, [attempt, loadData]);

  const retry = useCallback(() => {
    clearPortfolioDataCache();
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
