import { useEffect, useState } from 'react';
import { useSiteDataContext } from '@/app/providers/SiteDataProvider';

export function useSiteData() {
  return useSiteDataContext();
}

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

export function useBodyClass(className: string, enabled: boolean) {
  useEffect(() => {
    if (enabled) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }

    return () => {
      document.body.classList.remove(className);
    };
  }, [className, enabled]);
}

export function useLoaderTransition(loading: boolean, onReady: () => void) {
  const [visible, setVisible] = useState(true);
  const [display, setDisplay] = useState<'flex' | 'none'>('flex');

  useEffect(() => {
    if (loading) {
      setVisible(true);
      setDisplay('flex');
      return;
    }

    const hideTimer = window.setTimeout(() => {
      setVisible(false);
    }, 120);

    const removeTimer = window.setTimeout(() => {
      setDisplay('none');
      onReady();
    }, 380);

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(removeTimer);
    };
  }, [loading, onReady]);

  return { visible, display };
}
