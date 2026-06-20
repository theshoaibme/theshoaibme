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

interface SnakeIconItem {
  icon: string;
  title: string;
}

interface SnakeWaveMetrics {
  amplitude: number;
}

const SNAKE_WAVE_COUNT = 1;
const BASE_WAVE_SPEED = 0.85;
const SCROLL_DRIFT_SPEED = 90;

const DEVELOPMENT_SNAKE_ICONS: SnakeIconItem[] = [
  { icon: 'fa-brands fa-react', title: 'React' },
  { icon: 'fa-brands fa-node-js', title: 'Node.js' },
  { icon: 'fa-brands fa-python', title: 'Python' },
  { icon: 'fa-brands fa-java', title: 'Java' },
  { icon: 'fa-brands fa-aws', title: 'AWS' },
  { icon: 'fa-brands fa-docker', title: 'Docker' },
  { icon: 'fa-brands fa-js', title: 'JavaScript' },
  { icon: 'fa-brands fa-github', title: 'GitHub' },
  { icon: 'fa-solid fa-database', title: 'Databases' },
  { icon: 'fa-solid fa-server', title: 'Backend APIs' },
  { icon: 'fa-solid fa-cloud', title: 'Cloud' },
  { icon: 'fa-solid fa-mobile-screen', title: 'Mobile Apps' },
  { icon: 'fa-solid fa-brain', title: 'AI Solutions' },
  { icon: 'fa-brands fa-angular', title: 'Angular' },
  { icon: 'fa-brands fa-vuejs', title: 'Vue.js' },
  { icon: 'fa-solid fa-code', title: 'Development' },
  { icon: 'fa-brands fa-linux', title: 'Linux' },
  { icon: 'fa-brands fa-git-alt', title: 'Git' },
  { icon: 'fa-brands fa-html5', title: 'HTML5' },
  { icon: 'fa-brands fa-css3-alt', title: 'CSS3' },
  { icon: 'fa-brands fa-bootstrap', title: 'Bootstrap' },
  { icon: 'fa-brands fa-php', title: 'PHP' },
  { icon: 'fa-brands fa-npm', title: 'npm' },
  { icon: 'fa-solid fa-terminal', title: 'CLI' },
  { icon: 'fa-solid fa-microchip', title: 'System Design' },
  { icon: 'fa-solid fa-robot', title: 'Automation' },
  { icon: 'fa-solid fa-plug', title: 'Integrations' },
  { icon: 'fa-solid fa-shield-halved', title: 'Security' },
  { icon: 'fa-solid fa-gears', title: 'DevOps' },
  { icon: 'fa-solid fa-layer-group', title: 'Architecture' },
];

function getSnakeWaveMetrics(width: number): SnakeWaveMetrics {
  if (width < 480) {
    return { amplitude: 26 };
  }

  if (width < 768) {
    return { amplitude: 34 };
  }

  if (width < 1024) {
    return { amplitude: 42 };
  }

  return { amplitude: 50 };
}

function getWaveStep(count: number): number {
  if (count <= 1) return 0;
  return (2 * Math.PI * SNAKE_WAVE_COUNT) / (count - 1);
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

function ServicesSnakeWave() {
  const velocityFactor = useScrollVelocityFactor();
  const [metrics, setMetrics] = useState(() => getSnakeWaveMetrics(window.innerWidth));
  const metricsRef = useRef(metrics);
  const phase = useMotionValue(0);
  const horizontalX = useMotionValue(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const segmentWidthRef = useRef(0);
  const smoothPhase = useSpring(phase, {
    damping: 42,
    stiffness: 48,
    mass: 0.85,
  });
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
    const track = trackRef.current;
    if (!track) return;

    const updateSegmentWidth = () => {
      segmentWidthRef.current = track.scrollWidth / 2;
    };

    updateSegmentWidth();

    const observer = new ResizeObserver(updateSegmentWidth);
    observer.observe(track);
    window.addEventListener('resize', updateSegmentWidth, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSegmentWidth);
    };
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

    const dt = delta / 1000;
    const vf = velocityFactor?.get() ?? 0;

    phase.set(phase.get() + BASE_WAVE_SPEED * dt);

    if (Math.abs(vf) > 0.02) {
      let nextX = horizontalX.get() - vf * SCROLL_DRIFT_SPEED * dt;
      const segmentWidth = segmentWidthRef.current;

      if (segmentWidth > 0) {
        while (nextX <= -segmentWidth) nextX += segmentWidth;
        while (nextX > 0) nextX -= segmentWidth;
      }

      horizontalX.set(nextX);
    }
  });

  const snakeIcons = [...DEVELOPMENT_SNAKE_ICONS, ...DEVELOPMENT_SNAKE_ICONS];
  const waveStep = getWaveStep(DEVELOPMENT_SNAKE_ICONS.length);

  return (
    <div
      className="services-snake-row"
      style={{ '--snake-amplitude': `${metrics.amplitude}px` } as CSSProperties}
    >
      <motion.div ref={trackRef} className="services-snake-track" style={{ x: horizontalX }}>
        {snakeIcons.map((item, index) => (
          <SnakeIcon
            key={`${item.title}-${index}`}
            index={index % DEVELOPMENT_SNAKE_ICONS.length}
            waveStep={waveStep}
            phase={smoothPhase}
            amplitude={metrics.amplitude}
            icon={item.icon}
            title={item.title}
          />
        ))}
      </motion.div>
    </div>
  );
}

export default function ServicesSnakeMarquee() {
  return (
    <ScrollVelocityContainer className="services-snake-marquee" aria-hidden="true">
      <ServicesSnakeWave />
    </ScrollVelocityContainer>
  );
}
