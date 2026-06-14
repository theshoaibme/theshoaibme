import { useEffect } from 'react';

export function useRippleEffect() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.classList.contains('ripple')) return;

      const btn = target;
      const x = event.clientX - btn.offsetLeft;
      const y = event.clientY - btn.offsetTop;
      const ripples = document.createElement('span');
      ripples.classList.add('ripple-span');
      ripples.style.left = `${x}px`;
      ripples.style.top = `${y}px`;
      btn.appendChild(ripples);
      window.setTimeout(() => ripples.remove(), 1000);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
}
