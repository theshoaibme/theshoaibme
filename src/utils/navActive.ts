function getSectionIdFromHash(): string {
  const hash = window.location.hash;
  if (!hash || hash === '#') return 'hero';
  return decodeURIComponent(hash.slice(1));
}

let activeNavSection = getSectionIdFromHash();
const listeners = new Set<() => void>();

export function getActiveNavSection(): string {
  return activeNavSection;
}

export function setActiveNavSection(sectionId: string): void {
  const next = sectionId || 'hero';
  if (activeNavSection === next) return;
  activeNavSection = next;
  listeners.forEach((listener) => listener());
}

export function syncActiveNavSectionFromHash(): void {
  setActiveNavSection(getSectionIdFromHash());
}

export function subscribeActiveNavSection(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
