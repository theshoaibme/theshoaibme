import { ReactLenis, useLenis } from 'lenis/react';
import { useEffect, useState, type ReactNode } from 'react';
import { setLenis } from '@/utils/smoothScroll';
import 'lenis/dist/lenis.css';

function LenisBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    setLenis(lenis);
    return () => setLenis(null);
  }, [lenis]);

  return null;
}

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const [enabled, setEnabled] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event: MediaQueryListEvent) => setEnabled(!event.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        autoToggle: true,
        lerp: 0.06,
        smoothWheel: true,
        syncTouch: true,
        syncTouchLerp: 0.055,
        touchInertiaExponent: 1.9,
        wheelMultiplier: 0.82,
        touchMultiplier: 0.95,
      }}
    >
      <LenisBridge />
      {children}
    </ReactLenis>
  );
}
