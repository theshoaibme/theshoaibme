import { useCallback, useEffect, useRef, useState } from 'react';
import { getLenis, scrollToElement } from '@/utils/smoothScroll';

export interface SectionMeta {
  id: string;
  label: string;
  index: number;
  top: number;
  bottom: number;
  height: number;
  percent: number;
}

export interface RulerTick {
  pct: number;
  isMajor: boolean;
  label?: string;
  y: number;
}

export interface FontMetrics {
  adv: number[];
  cum: number[];
  total: number;
}

const SECTION_LABEL_MAP: Record<string, string> = {
  hero: 'HERO',
  activity: 'ACTIVITY',
  about: 'ABOUT',
  skills: 'SKILLS',
  experience: 'EXPERIENCE',
  services: 'SERVICES',
  portfolio: 'PORTFOLIO',
  testimonials: 'REVIEWS',
  contact: 'CONTACT',
};

export const EDGE_PAD = 14;
export const RAIL_WIDTH = 58;
export const HEADING_PX = 32;
export const RIDING_PX = 19;
export const QUEUE_PX = 15;
export const FLIP_ZONE = 220;
export const DETACH_ZONE = 240;
export const STAGGER = 0.16;
export const ARC_PX = 36;
export const TOP_PAD = 32;
export const QUEUE_PAD = 40;
export const QUEUE_SLOT = 24;

export function clamp01(val: number): number {
  return Math.min(Math.max(val, 0), 1);
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function getDocumentHeight(): number {
  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
  );
}

// Memory-only canvas metric measurement — zero DOM mutations, zero reflows
export function measureFontMetrics(labels: string[]): Record<string, FontMetrics> {
  if (typeof document === 'undefined') return {};
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const metrics: Record<string, FontMetrics> = {};
  if (ctx) {
    ctx.font = '700 100px "Space Grotesk", sans-serif';
  }

  for (const label of labels) {
    const adv: number[] = [];
    for (const char of label.split('')) {
      const w = ctx ? ctx.measureText(char).width / 100 : 0.6;
      adv.push(w || 0.6);
    }
    const cum: number[] = [];
    let total = 0;
    for (const w of adv) {
      cum.push(total);
      total += w;
    }
    metrics[label] = { adv, cum, total };
  }
  return metrics;
}

export function useRulerScroll() {
  const [sections, setSections] = useState<SectionMeta[]>([]);
  const [metrics, setMetrics] = useState<Record<string, FontMetrics>>({});
  const [activeSectionId, setActiveSectionId] = useState<string>('hero');
  const [ghostY, setGhostY] = useState<number | null>(null);
  const [ghostPercent, setGhostPercent] = useState<number>(0);

  const sectionsRef = useRef<SectionMeta[]>([]);
  const isDraggingRef = useRef(false);

  // Measure sections without triggering DOM mutations
  const updateMetrics = useCallback(() => {
    const vh = window.innerHeight;
    const docH = getDocumentHeight();
    const maxScroll = Math.max(1, docH - vh);

    const sectionElements = Array.from(
      document.querySelectorAll<HTMLElement>('main section[id], section[id]'),
    );

    if (!sectionElements.length) return;

    const measured: SectionMeta[] = [];
    const seenIds = new Set<string>();

    sectionElements.forEach((el) => {
      const id = el.id;
      if (!id || seenIds.has(id)) return;
      seenIds.add(id);

      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const height = rect.height;
      const bottom = top + height;
      const percent = clamp01(top / maxScroll);

      const label =
        SECTION_LABEL_MAP[id] ||
        id.replace(/[-_]/g, ' ').toUpperCase();

      measured.push({
        id,
        label,
        index: measured.length + 1,
        top,
        bottom,
        height,
        percent,
      });
    });

    sectionsRef.current = measured;
    setSections(measured);

    const fontM = measureFontMetrics(measured.map((m) => m.label));
    setMetrics(fontM);
  }, []);

  useEffect(() => {
    updateMetrics();

    let resizeTimer: number | undefined;
    const handleResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(updateMetrics, 100);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Measure when fonts are loaded
    if (document.fonts?.ready) {
      document.fonts.ready.then(updateMetrics).catch(() => {});
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimer) window.clearTimeout(resizeTimer);
    };
  }, [updateMetrics]);

  // Jump smoothly to a percentage
  const jumpToPercent = useCallback((pct: number) => {
    const clampedPct = clamp01(pct);
    const vh = window.innerHeight;
    const docH = getDocumentHeight();
    const targetY = clampedPct * Math.max(1, docH - vh);

    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(targetY, { duration: 1.15, lerp: 0.08 });
    } else {
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  }, []);

  // Jump to section
  const jumpToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    scrollToElement(el);
  }, []);

  // Pointer interactions for the rail
  const handleRailClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const vh = window.innerHeight;
      const usableHeight = Math.max(100, vh - 2 * EDGE_PAD);
      const rect = e.currentTarget.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const rawPct = (clickY - EDGE_PAD) / usableHeight;
      jumpToPercent(rawPct);
    },
    [jumpToPercent],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      isDraggingRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);

      const vh = window.innerHeight;
      const usableHeight = Math.max(100, vh - 2 * EDGE_PAD);
      const rect = e.currentTarget.getBoundingClientRect();
      const currentY = e.clientY - rect.top;
      const rawPct = (currentY - EDGE_PAD) / usableHeight;
      jumpToPercent(rawPct);
    },
    [jumpToPercent],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const vh = window.innerHeight;
    const usableHeight = Math.max(100, vh - 2 * EDGE_PAD);
    const rect = e.currentTarget.getBoundingClientRect();
    const currentY = Math.min(
      EDGE_PAD + usableHeight,
      Math.max(EDGE_PAD, e.clientY - rect.top),
    );
    const rawPct = clamp01((currentY - EDGE_PAD) / usableHeight);

    setGhostY(currentY);
    setGhostPercent(rawPct);

    if (isDraggingRef.current) {
      const docH = getDocumentHeight();
      const targetY = rawPct * Math.max(1, docH - vh);
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(targetY, { immediate: true });
      } else {
        window.scrollTo({ top: targetY });
      }
    }
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (!isDraggingRef.current) {
      setGhostY(null);
    }
  }, []);

  return {
    sections,
    metrics,
    activeSectionId,
    setActiveSectionId,
    sectionsRef,
    ghostY,
    ghostPercent,
    jumpToPercent,
    jumpToSection,
    handleRailClick,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerLeave,
  };
}
