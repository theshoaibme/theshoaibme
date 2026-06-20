import { useSyncExternalStore } from 'react';
import { getActiveNavSection, subscribeActiveNavSection } from '@/utils/navActive';

export function useActiveNavSection(): string {
  return useSyncExternalStore(
    subscribeActiveNavSection,
    getActiveNavSection,
    () => 'hero',
  );
}
