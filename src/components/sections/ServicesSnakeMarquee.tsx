import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import {
  ScrollVelocityContainer,
  useScrollVelocityFactor,
} from '@/components/effects/ScrollVelocity';
import type { Service } from '@/types';

interface ServicesSnakeMarqueeProps {
  services: Service[];
}

interface SnakeWaveMetrics {
  amplitude: number;
  maxHorizontalShift: number;
  maxHorizontalSpeed: number;
  repeatCount: number;
}

const SNAKE_WAVE_COUNT = 1;
const BASE_WAVE_SPEED = 1;
const SCROLL_WAVE_SPEED = 2.5;
const HORIZONTAL_VELOCITY_SCALE = 0.35;
const HORIZONTAL_SMOOTHING = 4.5;
const SPEED_SMOOTHING = 6;

function getSnakeWaveMetrics(width: number): SnakeWaveMetrics {
  if (width < 480) {
    return {
      amplitude: 18,
      maxHorizontalShift: 12,
      maxHorizontalSpeed: 48,
      repeatCount: 1,
    };
  }

  if (width < 768) {
    return {
      amplitude: 24,
      maxHorizontalShift: 16,
      maxHorizontalSpeed: 60,
      repeatCount: 1,
    };
  }

  if (width < 1024) {
    return {
      amplitude: 30,
      maxHorizontalShift: 20,
      maxHorizontalSpeed: 72,
      repeatCount: 2,
    };
  }

  return {
    amplitude: 36,
    maxHorizontalShift: 24,
    maxHorizontalSpeed: 80,
    repeatCount: 2,
  };
}

function getWaveStep(count: number): number {
  if (count <= 1) return 0;
  return (2 * Math.PI * SNAKE_WAVE_COUNT) / (count - 1);
}

function buildWaveItems(services: Service[], repeatCount: number): Service[] {
  return Array.from({ length: repeatCount }, () => services).flat();
}

interface SnakeIconProps {
  index: number;
  waveStep: number;
  phase: MotionValue<number>;
  amplitude: number;
  icon: string;
  title: string;
}

function SnakeIcon({ index, waveStep, phase, amplitude, icon, title }: SnakeIconProps) {
  const y = useTransform(phase, (p) => Math.sin(index * waveStep + p) * amplitude);

  return (
    <motion.div className="services-snake-icon" style={{ y }} aria-label={title} title={title}>
      <i className={icon} aria-hidden="true" />
    </motion.div>
  );
}

function getHorizontalTarget(
  velocityFactor: number,
  maxHorizontalShift: number,
): number {
  const normalized = Math.tanh(velocityFactor * HORIZONTAL_VELOCITY_SCALE);
  return normalized * maxHorizontalShift;
}

function ServicesSnakeWave({ services }: { services: Service[] }) {
  const velocityFactor = useScrollVelocityFactor();
  const [metrics, setMetrics] = useState(() => getSnakeWaveMetrics(window.innerWidth));
  const metricsRef = useRef(metrics);
  const phase = useMotionValue(0);
  const horizontalX = useMotionValue(0);
  const smoothPhase = useSpring(phase, {
    damping: 42,
    stiffness: 48,
    mass: 0.85,
  });
  const smoothX = useSpring(horizontalX, {
    damping: 62,
    stiffness: 24,
    mass: 1.1,
  });
  const horizontalTargetRef = useRef(0);
  const speedRef = useRef(BASE_WAVE_SPEED);
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(getSnakeWaveMetrics(window.innerWidth));
    };

    updateMetrics();
    window.addEventListener('resize', updateMetrics, { passive: true });
    return () => window.removeEventListener('resize', updateMetrics);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      prefersReducedMotionRef.current = mq.matches;
    };
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useAnimationFrame((_, delta) => {
    if (prefersReducedMotionRef.current) return;

    const { maxHorizontalShift, maxHorizontalSpeed } = metricsRef.current;
    const dt = delta / 1000;
    const vf = velocityFactor?.get() ?? 0;

    const targetSpeed = BASE_WAVE_SPEED + vf * SCROLL_WAVE_SPEED;
    const speedBlend = 1 - Math.exp(-SPEED_SMOOTHING * dt);
    speedRef.current += (targetSpeed - speedRef.current) * speedBlend;
    phase.set(phase.get() + speedRef.current * dt);

    const targetX = getHorizontalTarget(vf, maxHorizontalShift);
    const horizontalBlend = 1 - Math.exp(-HORIZONTAL_SMOOTHING * dt);
    horizontalTargetRef.current +=
      (targetX - horizontalTargetRef.current) * horizontalBlend;

    const currentX = horizontalX.get();
    const deltaX = horizontalTargetRef.current - currentX;
    const maxStep = maxHorizontalSpeed * dt;
    const step = Math.abs(deltaX) <= maxStep ? deltaX : Math.sign(deltaX) * maxStep;
    horizontalX.set(currentX + step);
  });

  const items = buildWaveItems(services, metrics.repeatCount);
  const waveStep = getWaveStep(items.length);

  return (
    <div
      className="services-snake-row"
      style={{ '--snake-amplitude': `${metrics.amplitude}px` } as CSSProperties}
    >
      <motion.div className="services-snake-track" style={{ x: smoothX }}>
        {items.map((service, index) => (
          <SnakeIcon
            key={`${service.title}-${index}`}
            index={index}
            waveStep={waveStep}
            phase={smoothPhase}
            amplitude={metrics.amplitude}
            icon={service.icon}
            title={service.title}
          />
        ))}
      </motion.div>
    </div>
  );
}

export default function ServicesSnakeMarquee({ services }: ServicesSnakeMarqueeProps) {
  return (
    <ScrollVelocityContainer className="services-snake-marquee" aria-hidden="true">
      <ServicesSnakeWave services={services} />
    </ScrollVelocityContainer>
  );
}
