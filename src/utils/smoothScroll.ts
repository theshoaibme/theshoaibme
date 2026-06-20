import type Lenis from 'lenis';

export const SCROLL_OFFSET = -100;

let lenisInstance: Lenis | null = null;

export function setLenis(instance: Lenis | null): void {
  lenisInstance = instance;
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}

export function scrollToElement(
  target: Element,
  options?: { immediate?: boolean },
): void {
  if (lenisInstance && target instanceof HTMLElement) {
    lenisInstance.scrollTo(target, {
      offset: SCROLL_OFFSET,
      duration: options?.immediate ? 0 : 1.35,
      lerp: 0.06,
    });
    return;
  }

  target.scrollIntoView({
    behavior: options?.immediate ? 'auto' : 'smooth',
    block: 'start',
  });
}
