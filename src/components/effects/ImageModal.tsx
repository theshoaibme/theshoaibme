interface ImageModalProps {
  active: boolean;
  imageSrc: string;
  onClose: () => void;
}

export default function ImageModal({ active, imageSrc, onClose }: ImageModalProps) {
  return (
    <div
      id="image-modal"
      className={`image-modal${active ? ' active' : ''}`}
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
      }}
      role="presentation"
    >
      <div className="modal-backdrop" />
      <button
        type="button"
        className="modal-close"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
      >
        <i className="fa-solid fa-xmark" />
      </button>
      <div className="modal-content">
        <img
          src={imageSrc}
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
