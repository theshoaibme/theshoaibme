import { useEffect } from 'react';
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
