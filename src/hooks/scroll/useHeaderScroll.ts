import { useEffect, useState } from 'react';
import { getScrollTop } from '@/utils/scroll';

const HIDE_AFTER_OFFSET = 80;
const TOP_REVEAL_OFFSET = 50;
const SCROLL_DELTA_THRESHOLD = 4;

interface UseHeaderScrollOptions {
  enabled?: boolean;
}

export function useHeaderScroll({ enabled = true }: UseHeaderScrollOptions = {}) {
  const [isHidden, setIsHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsHidden(false);
      setIsScrolled(false);
      return;
    }

    let lastScrollY = getScrollTop();
    let isNavigating = false;
    let navTimeout: number | undefined;
    let frameId = 0;

    const updateHeader = () => {
      frameId = 0;

      if (isNavigating) return;

      const currentScroll = getScrollTop();
      const scrollDelta = currentScroll - lastScrollY;

      if (currentScroll <= TOP_REVEAL_OFFSET) {
        setIsHidden(false);
        setIsScrolled(false);
        lastScrollY = currentScroll;
        return;
      }

      setIsScrolled(true);

      if (Math.abs(scrollDelta) >= SCROLL_DELTA_THRESHOLD) {
        if (scrollDelta > 0 && currentScroll > HIDE_AFTER_OFFSET) {
          setIsHidden(true);
        } else if (scrollDelta < 0) {
          setIsHidden(false);
        }
      }

      lastScrollY = currentScroll;
    };

    const handleScroll = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateHeader);
    };

    const handleNavClick = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest('.navbar a') as HTMLAnchorElement | null;
      const href = link?.getAttribute('href');

      if (link && href?.startsWith('#')) {
        isNavigating = true;
        setIsHidden(false);

        if (navTimeout) window.clearTimeout(navTimeout);
        navTimeout = window.setTimeout(() => {
          isNavigating = false;
          lastScrollY = getScrollTop();
        }, 1000);
      }
    };

    updateHeader();

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    document.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    document.addEventListener('click', handleNavClick);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('click', handleNavClick);
      if (navTimeout) window.clearTimeout(navTimeout);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [enabled]);

  const headerClassName = ['header', isHidden ? 'hidden' : '', isScrolled ? 'scrolled' : '']
    .filter(Boolean)
    .join(' ');

  return { isHidden, isScrolled, headerClassName };
}
