import { useEffect } from 'react';
import { scrollToElement } from '@/utils/smoothScroll';

function bindSmoothScroll() {
  const anchorLinks = document.querySelectorAll<HTMLAnchorElement>(
    '.navbar a[href^="#"], #scroll-container a[href^="#"]',
  );

  if (!anchorLinks.length) return;

  const handlers: Array<{ link: HTMLAnchorElement; handler: (event: Event) => void }> = [];

  anchorLinks.forEach((link) => {
    const handler = (event: Event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetSection = document.querySelector(targetId);
      if (!targetSection) return;

      event.preventDefault();
      scrollToElement(targetSection);

      if (window.location.hash !== targetId) {
        history.pushState(null, '', targetId);
      }

      document.querySelectorAll('.navbar a').forEach((navLink) => {
        navLink.classList.toggle('active', navLink.getAttribute('href') === targetId);
      });
    };

    link.addEventListener('click', handler);
    handlers.push({ link, handler });
  });

  return () => {
    handlers.forEach(({ link, handler }) => link.removeEventListener('click', handler));
  };
}

export function useSmoothNavScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    return bindSmoothScroll();
  }, [enabled]);
}
