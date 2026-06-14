import { useEffect } from 'react';

export function useRevealAnimations(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const observerOptions: IntersectionObserverInit = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [enabled]);
}

export function useSectionObserver(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('section-hidden');
            entry.target.classList.add('section-visible');
            sectionObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px',
      },
    );

    document.querySelectorAll('section').forEach((section) => {
      sectionObserver.observe(section);
    });

    return () => sectionObserver.disconnect();
  }, [enabled]);
}

export function hideAllSections() {
  document.querySelectorAll('section').forEach((section) => {
    section.classList.add('section-hidden');
  });
}
