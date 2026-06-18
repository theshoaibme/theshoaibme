import { useEffect } from 'react';
import { scrollToElement } from '@/utils/smoothScroll';

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
      scrollToElement(targetElement);

      const navLinks = document.querySelectorAll('.navbar a');
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === hash);
      });
    }, 100);

    return () => window.clearTimeout(scrollTimer);
  }, [enabled]);
}
