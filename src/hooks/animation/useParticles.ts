import { useEffect } from 'react';

export function useParticlesSystem(enabled: boolean, onInit?: (reinit: () => void) => void) {
  useEffect(() => {
    if (!enabled) return;

    const canvas = document.getElementById('particle-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    const particleCount = 200;
    let animationFrameId = 0;

    function getParticleColors() {
      return [
        'rgba(66, 133, 244, 0.6)',
        'rgba(234, 67, 53, 0.6)',
        'rgba(251, 188, 5, 0.6)',
        'rgba(52, 168, 83, 0.6)',
      ];
    }

    class Particle {
      x = 0;
      y = 0;
      size = 0;
      color = '';
      vx = 0;
      vy = 0;
      maxSpeed = 0;

      constructor() {
        this.init();
      }

      init() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 1.8 + 0.2;
        const colors = getParticleColors();
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.maxSpeed = Math.random() * 0.6 + 0.2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x > canvas!.width) this.x = 0;
        else if (this.x < 0) this.x = canvas!.width;
        if (this.y > canvas!.height) this.y = 0;
        else if (this.y < 0) this.y = canvas!.height;
        if (Math.random() < 0.02) {
          this.vx += (Math.random() - 0.5) * 0.1;
          this.vy += (Math.random() - 0.5) * 0.1;
          const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
          if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
          }
        }
      }

      draw() {
        ctx!.fillStyle = this.color;
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i += 1) {
        particles.push(new Particle());
      }
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animateParticles);
    };

    onInit?.(initParticles);

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animateParticles();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [enabled, onInit]);
}
