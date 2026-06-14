import { useCallback, useState } from 'react';

export function useImageModal() {
  const [active, setActive] = useState(false);
  const [imageSrc, setImageSrc] = useState('');

  const openModal = useCallback((src: string) => {
    if (!src) return;
    setImageSrc(src);
    setActive(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setActive(false);
    document.body.style.overflow = '';
  }, []);

  return { active, imageSrc, openModal, closeModal };
}
