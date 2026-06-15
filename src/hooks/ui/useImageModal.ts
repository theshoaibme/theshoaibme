import { useCallback, useState } from 'react';

export type ImageModalVariant = 'round' | 'square';

export function useImageModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [variant, setVariant] = useState<ImageModalVariant>('round');

  const openModal = useCallback((src: string, nextVariant: ImageModalVariant = 'round') => {
    const nextSrc = src.trim();
    if (!nextSrc) return;

    setImageSrc(nextSrc);
    setVariant(nextVariant);
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = '';
  }, []);

  const clearModal = useCallback(() => {
    setImageSrc(null);
    setVariant('round');
  }, []);

  return { isOpen, imageSrc, variant, openModal, closeModal, clearModal };
}
