import { useCallback, useState } from 'react';

export function useImageModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const openModal = useCallback((src: string) => {
    const nextSrc = src.trim();
    if (!nextSrc) return;

    setImageSrc(nextSrc);
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = '';
  }, []);

  const clearModal = useCallback(() => {
    setImageSrc(null);
  }, []);

  return { isOpen, imageSrc, openModal, closeModal, clearModal };
}
