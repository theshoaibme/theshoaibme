import { useEffect, useRef } from 'react';
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

const SNAKE_WAVE_COUNT = 1;
const SNAKE_AMPLITUDE = 56;
const BASE_WAVE_SPEED = 1;
const SCROLL_WAVE_SPEED = 2.5;
const MAX_HORIZONTAL_SHIFT = 44;
const HORIZONTAL_VELOCITY_SCALE = 0.55;
const HORIZONTAL_SMOOTHING = 4.5;
const MAX_HORIZONTAL_SPEED = 140;
const SPEED_SMOOTHING = 6;

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

function getHorizontalTarget(velocityFactor: number): number {
  const normalized = Math.tanh(velocityFactor * HORIZONTAL_VELOCITY_SCALE);
  return normalized * MAX_HORIZONTAL_SHIFT;
}

function ServicesSnakeWave({ services }: { services: Service[] }) {
  const velocityFactor = useScrollVelocityFactor();
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

    const targetSpeed = BASE_WAVE_SPEED + vf * SCROLL_WAVE_SPEED;
    const speedBlend = 1 - Math.exp(-SPEED_SMOOTHING * dt);
    speedRef.current += (targetSpeed - speedRef.current) * speedBlend;
    phase.set(phase.get() + speedRef.current * dt);

    const targetX = getHorizontalTarget(vf);
    const horizontalBlend = 1 - Math.exp(-HORIZONTAL_SMOOTHING * dt);
    horizontalTargetRef.current +=
      (targetX - horizontalTargetRef.current) * horizontalBlend;

    const currentX = horizontalX.get();
    const deltaX = horizontalTargetRef.current - currentX;
    const maxStep = MAX_HORIZONTAL_SPEED * dt;
    const step =
      Math.abs(deltaX) <= maxStep
        ? deltaX
        : Math.sign(deltaX) * maxStep;
    horizontalX.set(currentX + step);
  });

  const items = [...services, ...services];
  const waveStep = getWaveStep(items.length);

  return (
    <motion.div className="services-snake-row" style={{ x: smoothX }}>
      {items.map((service, index) => (
        <SnakeIcon
          key={`${service.title}-${index}`}
          index={index}
          waveStep={waveStep}
          phase={smoothPhase}
          icon={service.icon}
          title={service.title}
        />
      ))}
    </motion.div>
  );
}

export default function ServicesSnakeMarquee({ services }: ServicesSnakeMarqueeProps) {
  return (
    <ScrollVelocityContainer className="services-snake-marquee" aria-hidden="true">
      <ServicesSnakeWave services={services} />
    </ScrollVelocityContainer>
  );
}
