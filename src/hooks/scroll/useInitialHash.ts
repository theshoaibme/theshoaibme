import { useEffect } from 'react';

export function useInitialHash(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const hash = window.location.hash;
    if (!hash) return;

    const targetElement = document.querySelector(hash);
    if (!targetElement) return;

    targetElement.classList.remove('section-hidden');
    targetElement.classList.add('section-visible');

    targetElement.querySelectorAll('.reveal').forEach((el) => {
      el.classList.add('active');
    });

    const scrollTimer = window.setTimeout(() => {
      targetElement.scrollIntoView({ behavior: 'smooth' });

      const navLinks = document.querySelectorAll('.navbar a');
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === hash);
      });
    }, 100);

    return () => window.clearTimeout(scrollTimer);
  }, [enabled]);
}
