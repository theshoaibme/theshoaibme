import { useEffect } from 'react';
import { useSiteDataContext } from '@/app/providers/SiteDataProvider';

export function useSiteData() {
  return useSiteDataContext();
}

export function useDocumentTitle(title: string, description?: string) {
  useEffect(() => {
    document.title = title;
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }
  }, [title, description]);
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
