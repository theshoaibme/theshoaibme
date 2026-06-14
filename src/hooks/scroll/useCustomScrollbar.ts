import { useEffect } from 'react';
import { getScrollTop } from '@/utils/scroll';

function getDocumentHeight(): number {
  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
  );
}

export function useCustomScrollbar() {
  useEffect(() => {
    const thumb = document.getElementById('scrollbar-thumb');
    const track = document.getElementById('scrollbar-track');
    if (!thumb || !track) return;

    const updateScrollbar = () => {
      const docHeight = getDocumentHeight();
      const winHeight = window.innerHeight;
      const scrollTop = getScrollTop();

      if (docHeight <= winHeight) {
        thumb.style.height = '0px';
        return;
      }

      const scrollPercent = scrollTop / (docHeight - winHeight);
      const thumbHeight = Math.max(20, (winHeight / docHeight) * winHeight);
      const maxTop = winHeight - thumbHeight;
      const thumbTop = scrollPercent * maxTop;

      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translateY(${thumbTop}px)`;
    };

    let scrollTimeout: number | undefined;

    const onScroll = () => {
      document.body.classList.add('scrolling');
      if (scrollTimeout) window.clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        document.body.classList.remove('scrolling');
      }, 1000);
      updateScrollbar();
    };

    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', updateScrollbar);

    const observer = new MutationObserver(updateScrollbar);
    observer.observe(document.body, { childList: true, subtree: true });

    updateScrollbar();

    return () => {
      window.removeEventListener('scroll', onScroll, true);
      document.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', updateScrollbar);
      observer.disconnect();
      if (scrollTimeout) window.clearTimeout(scrollTimeout);
    };
  }, []);
}
