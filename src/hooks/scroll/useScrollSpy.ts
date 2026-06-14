import { useEffect } from 'react';
import { getScrollTop } from '@/utils/scroll';

export function useScrollSpy(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar a');
    if (!sections.length || !navLinks.length) return;

    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });

          if (window.location.hash !== `#${id}`) {
            history.replaceState(null, '', `#${id}`);
          }
        }
      });
    }, options);

    sections.forEach((section) => observer.observe(section));

    const handleScrollTop = () => {
      if (getScrollTop() < 100) {
        navLinks.forEach((l) => l.classList.remove('active'));
        if (navLinks[0]) navLinks[0].classList.add('active');

        if (window.location.hash !== '') {
          history.replaceState(null, '', window.location.pathname);
        }
      }
    };

    window.addEventListener('scroll', handleScrollTop);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScrollTop);
    };
  }, [enabled]);
}
