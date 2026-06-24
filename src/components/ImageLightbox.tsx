import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ImageLightboxProps {
  src: string;
  alt: string;
  title?: string;
  description?: string;
  onClose: () => void;
}

export function ImageLightbox({
  src,
  alt,
  title,
  description,
  onClose,
}: ImageLightboxProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div className="image-lightbox" role="presentation" onClick={onClose}>
      <section
        className="image-lightbox__panel"
        role="dialog"
        aria-modal="true"
        aria-label={title ?? alt}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="image-lightbox__close"
          type="button"
          aria-label="关闭大图"
          onClick={onClose}
        >
          ×
        </button>
        <img className="image-lightbox__image" src={src} alt={alt} />
        {title || description ? (
          <div className="image-lightbox__caption">
            {title ? <strong>{title}</strong> : null}
            {description ? <span>{description}</span> : null}
          </div>
        ) : null}
      </section>
    </div>,
    document.body,
  );
}
