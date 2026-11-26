import React, { useState, useEffect, useRef } from 'react';
import { LiquidMetal } from '@paper-design/shaders-react';
import { cn } from '@/lib/utils';

export interface LiquidMetalBorderProps {
  children: React.ReactNode;
  className?: string;
  borderRadius?: number;
  borderWidth?: number;
  colorBack?: string;
  colorTint?: string;
  repetition?: number;
  softness?: number;
  shiftRed?: number;
  shiftBlue?: number;
  distortion?: number;
  contour?: number;
  angle?: number;
  speed?: number;
  scale?: number;
  opacity?: number;
  theme?: 'light' | 'dark';
}

export function LiquidMetalBorder({
  children,
  className,
  borderRadius = 9999,
  borderWidth = 3,
  colorBack,
  colorTint,
  repetition = 7,
  softness = 0.05,
  shiftRed = 0.6,
  shiftBlue = 0.3,
  distortion = 0.1,
  contour = 0.4,
  angle = 90,
  speed = 0.9,
  scale = 4,
  opacity = 0.7,
  theme = 'dark',
}: LiquidMetalBorderProps) {
  const defaultColorBack = theme === 'light' ? '#888888' : '#aaaaac';
  const defaultColorTint = theme === 'light' ? '#ffffff' : '#ffffff';

  const [isVisible, setIsVisible] = useState(true);
  const [shaderKey, setShaderKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const checkRect = () => {
      const rect = element.getBoundingClientRect();
      const inView = rect.top < window.innerHeight + 100 && rect.bottom > -100;
      setIsVisible(inView);
    };

    checkRect();

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        rootMargin: '100px',
        threshold: 0,
      },
    );

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setShaderKey((prev) => prev + 1);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkRect();
      }
    };

    observer.observe(element);
    element.addEventListener('webglcontextlost', handleContextLost, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      observer.disconnect();
      element.removeEventListener('webglcontextlost', handleContextLost, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('liquid-metal-border-container', className)}
      style={{
        borderRadius,
        padding: borderWidth,
      }}
    >
      <div
        className="liquid-metal-border-shader"
        style={{ borderRadius, opacity }}
      >
        <LiquidMetal
          key={shaderKey}
          style={{ width: '100%', height: '100%' }}
          colorBack={colorBack ?? defaultColorBack}
          colorTint={colorTint ?? defaultColorTint}
          shape="none"
          repetition={repetition}
          softness={softness}
          shiftRed={shiftRed}
          shiftBlue={shiftBlue}
          distortion={distortion}
          contour={contour}
          angle={angle}
          speed={isVisible ? speed : 0}
          scale={scale}
          fit="cover"
        />
      </div>

      <div
        className="liquid-metal-border-content"
        style={{
          borderRadius: borderRadius - borderWidth,
        }}
      >
        {children}
      </div>
    </div>
  );
}
