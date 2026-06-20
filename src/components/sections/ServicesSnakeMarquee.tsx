import { useEffect, useRef } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
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

const SNAKE_WAVE_COUNT = 1;
const SNAKE_AMPLITUDE = 56;
const BASE_WAVE_SPEED = 1.2;
const SCROLL_WAVE_SPEED = 3;

function getWaveStep(count: number): number {
  if (count <= 1) return 0;
  return (2 * Math.PI * SNAKE_WAVE_COUNT) / (count - 1);
}

interface SnakeIconProps {
  index: number;
  waveStep: number;
  phase: MotionValue<number>;
  icon: string;
  title: string;
}

function SnakeIcon({ index, waveStep, phase, icon, title }: SnakeIconProps) {
  const y = useTransform(phase, (p) => Math.sin(index * waveStep + p) * SNAKE_AMPLITUDE);

  return (
    <motion.div className="services-snake-icon" style={{ y }} aria-label={title} title={title}>
      <i className={icon} aria-hidden="true" />
    </motion.div>
  );
}

function ServicesSnakeWave({ services }: { services: Service[] }) {
  const velocityFactor = useScrollVelocityFactor();
  const phase = useMotionValue(0);
  const prefersReducedMotionRef = useRef(false);

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

    const dt = delta / 1000;
    const vf = velocityFactor?.get() ?? 0;
    const scrollBoost = Math.abs(vf) > 0.05 ? vf * SCROLL_WAVE_SPEED : 0;
    phase.set(phase.get() + (BASE_WAVE_SPEED + scrollBoost) * dt);
  });

  const items = [...services, ...services];
  const waveStep = getWaveStep(items.length);

  return (
    <div className="services-snake-row">
      {items.map((service, index) => (
        <SnakeIcon
          key={`${service.title}-${index}`}
          index={index}
          waveStep={waveStep}
          phase={phase}
          icon={service.icon}
          title={service.title}
        />
      ))}
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
