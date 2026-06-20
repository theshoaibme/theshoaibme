import { useEffect } from 'react';
import { restoreRouteHash, subscribeToHashNavigation } from '@/utils/hashScroll';

export function useInitialHash(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const restore = () => {
      void restoreRouteHash({ immediate: true }).then(() => {
        if (cancelled) return;
      });
    };

    restore();

    const unsubscribe = subscribeToHashNavigation(() => {
      if (!cancelled) restore();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [enabled]);
}
