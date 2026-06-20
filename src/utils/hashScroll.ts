import { isHomePath } from '@/utils/routing';
import { setActiveNavSection, syncActiveNavSectionFromHash } from '@/utils/navActive';
import { getLenis, SCROLL_OFFSET, scrollToElement } from '@/utils/smoothScroll';

let hashRestoreComplete = !getInitialHash();
let restoreGeneration = 0;

function getInitialHash(): string {
  const hash = window.location.hash;
  if (!hash || hash === '#') return '';
  return hash;
}

export function configureManualScrollRestoration(): void {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  syncActiveNavSectionFromHash();

  // Keep the URL hash but start at the top until React restores the section.
  if (getInitialHash()) {
    window.scrollTo(0, 0);
  }
}

export function isHashRestoreComplete(): boolean {
  return hashRestoreComplete;
}

function getSectionIdFromHash(): string | null {
  const hash = window.location.hash;
  if (!hash || hash === '#') return null;
  return decodeURIComponent(hash.slice(1));
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForSection(sectionId: string, timeoutMs = 8000): Promise<HTMLElement | null> {
  const selector = `#${CSS.escape(sectionId)}`;
  const started = performance.now();

  while (performance.now() - started < timeoutMs) {
    const element = document.querySelector<HTMLElement>(selector);
    if (element) return element;
    await wait(16);
  }

  return null;
}

async function waitForScrollReady(timeoutMs = 8000): Promise<void> {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const started = performance.now();

  while (performance.now() - started < timeoutMs) {
    if (getLenis()) return;
    await wait(16);
  }
}

function syncNavActiveState(sectionId: string): void {
  setActiveNavSection(sectionId);
}

function isSectionInView(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return rect.top <= Math.abs(SCROLL_OFFSET) + 80 && rect.bottom > 120;
}

function scrollToSectionImmediate(element: HTMLElement): void {
  const lenis = getLenis();

  if (lenis) {
    lenis.resize();
    lenis.scrollTo(element, {
      offset: SCROLL_OFFSET,
      immediate: true,
    });
    return;
  }

  const top =
    element.getBoundingClientRect().top + window.scrollY + SCROLL_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
}

async function ensureSectionVisible(element: HTMLElement): Promise<void> {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    scrollToSectionImmediate(element);

    await wait(attempt === 0 ? 32 : 80);

    if (isSectionInView(element)) return;

    scrollToElement(element, { immediate: true });
    await wait(80);
    if (isSectionInView(element)) return;
  }
}

export async function restoreRouteHash(options?: { immediate?: boolean }): Promise<void> {
  const generation = ++restoreGeneration;
  hashRestoreComplete = false;

  const sectionId = getSectionIdFromHash();
  if (!sectionId || !isHomePath(window.location.pathname)) {
    if (generation === restoreGeneration) {
      hashRestoreComplete = true;
    }
    return;
  }

  syncNavActiveState(sectionId);

  const element = await waitForSection(sectionId);
  if (!element || generation !== restoreGeneration) {
    if (generation === restoreGeneration) {
      hashRestoreComplete = true;
    }
    return;
  }

  await waitForScrollReady();
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

  if (generation !== restoreGeneration) return;

  if (options?.immediate ?? true) {
    await ensureSectionVisible(element);
  } else {
    scrollToElement(element, { immediate: false });
    await wait(300);
  }

  if (generation !== restoreGeneration) return;

  syncNavActiveState(sectionId);
  await wait(120);

  if (generation === restoreGeneration) {
    hashRestoreComplete = true;
  }
}

export function subscribeToHashNavigation(onNavigate: () => void): () => void {
  const handler = () => {
    syncActiveNavSectionFromHash();
    onNavigate();
  };

  window.addEventListener('hashchange', handler);
  window.addEventListener('popstate', handler);

  return () => {
    window.removeEventListener('hashchange', handler);
    window.removeEventListener('popstate', handler);
  };
}
