import { useEffect, useState } from 'react';
import type { CharacterImage } from '../types/game';

interface CharacterDisplayProps {
  image: CharacterImage;
  caption?: string;
  compact?: boolean;
}

export function CharacterDisplay({ image, caption, compact = false }: CharacterDisplayProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [image.src]);

  return (
    <figure className={`character-display ${compact ? 'character-display--compact' : ''}`}>
      <div className="character-display__frame">
        {!hasError ? (
          <img
            className="character-display__image"
            src={image.src}
            alt={image.alt}
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="character-display__fallback" role="img" aria-label={image.alt}>
            <span>杨小獭</span>
            <small>{image.label}</small>
          </div>
        )}
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

