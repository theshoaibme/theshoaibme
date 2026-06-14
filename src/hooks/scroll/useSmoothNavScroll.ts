import { useEffect } from 'react';

export function useSmoothNavScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const navLinks = document.querySelectorAll('.navbar a[href^="#"]');
    if (!navLinks.length) return;

    const handlers: Array<{ link: Element; handler: (event: Event) => void }> = [];

    navLinks.forEach((link) => {
      const handler = (event: Event) => {
        const targetId = link.getAttribute('href');
        if (!targetId) return;

        const targetSection = document.querySelector(targetId);
        if (!targetSection) return;

        event.preventDefault();
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        if (window.location.hash !== targetId) {
          history.pushState(null, '', targetId);
        }
      };

      link.addEventListener('click', handler);
      handlers.push({ link, handler });
    });

    return () => {
      handlers.forEach(({ link, handler }) => link.removeEventListener('click', handler));
    };
  }, [enabled]);
}
