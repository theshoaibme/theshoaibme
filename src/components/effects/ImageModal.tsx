import { useEffect, useRef, useState } from 'react';

const MODAL_CLOSE_MS = 420;

interface ImageModalProps {
  imageSrc: string;
  isOpen: boolean;
  onClose: () => void;
  onClosed: () => void;
}

export default function ImageModal({ imageSrc, isOpen, onClose, onClosed }: ImageModalProps) {
  const closeTimerRef = useRef<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const safeSrc = imageSrc.trim();

  useEffect(() => {
    if (!safeSrc) {
      setIsVisible(false);
      return;
    }

    if (isOpen) {
      const frame = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setIsVisible(true));
      });

      return () => window.cancelAnimationFrame(frame);
    }

    setIsVisible(false);
  }, [isOpen, safeSrc]);

  useEffect(() => {
    if (isOpen || !safeSrc) {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      return;
    }

    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      onClosed();
    }, MODAL_CLOSE_MS);

    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [isOpen, onClosed, safeSrc]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!safeSrc) {
    return null;
  }

  return (
    <div
      id="image-modal"
      className={`image-modal${isVisible ? ' active' : ''}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Profile image preview"
    >
      <div className="modal-backdrop" />
      <button
        type="button"
        className="modal-close"
        aria-label="Close profile image"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
      >
        <i className="fa-solid fa-xmark" aria-hidden="true" />
      </button>
      <div className="modal-content">
        <img
          src={safeSrc}
          alt="Profile Full"
          id="modal-img"
          onError={(event) => {
            event.currentTarget.alt = 'Image failed to load';
          }}
        />
      </div>
    </div>
  );
}
