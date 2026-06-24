import { useEffect, useState } from 'react';
import type { CharacterImage } from '../types/game';
import { ImageLightbox } from './ImageLightbox';

interface CharacterDisplayProps {
  image: CharacterImage;
  caption?: string;
  compact?: boolean;
  zoomable?: boolean;
  zoomTitle?: string;
  zoomDescription?: string;
  showZoomHint?: boolean;
}

export function CharacterDisplay({
  image,
  caption,
  compact = false,
  zoomable = false,
  zoomTitle,
  zoomDescription,
  showZoomHint = false,
}: CharacterDisplayProps) {
  const [hasError, setHasError] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    setHasError(false);
    setIsLightboxOpen(false);
  }, [image.src]);

  const canZoom = zoomable && !hasError && !image.placeholderText;
  const title = zoomTitle ?? caption ?? image.label;

  return (
    <figure
      className={`character-display ${compact ? 'character-display--compact' : ''} ${
        canZoom ? 'character-display--zoomable' : ''
      }`}
    >
      <div className="character-display__frame">
        {!hasError && canZoom ? (
          <button
            className="image-zoom-trigger"
            type="button"
            aria-label={`查看大图：${title}`}
            onClick={() => setIsLightboxOpen(true)}
          >
            <img
              className="character-display__image"
              src={image.src}
              alt={image.alt}
              onError={() => setHasError(true)}
            />
          </button>
        ) : !hasError ? (
          <img
            className="character-display__image"
            src={image.src}
            alt={image.alt}
            onError={() => setHasError(true)}
          />
        ) : (
          <div
            className={`character-display__fallback ${
              image.placeholderText ? 'character-display__fallback--placeholder' : ''
            }`}
            role="img"
            aria-label={image.alt}
          >
            <span>{image.placeholderText ?? '杨小獭'}</span>
            <small>{image.label}</small>
          </div>
        )}
      </div>
      {canZoom && showZoomHint ? (
        <span className="image-zoom-hint">点击查看大图</span>
      ) : null}
      {caption ? <figcaption>{caption}</figcaption> : null}
      {isLightboxOpen ? (
        <ImageLightbox
          src={image.src}
          alt={image.alt}
          title={title}
          description={zoomDescription}
          onClose={() => setIsLightboxOpen(false)}
        />
      ) : null}
    </figure>
  );
}
