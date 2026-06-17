import { useState } from 'react';
import { GALLERY_ITEMS } from '../config/gallery';
import { getVisualAsset } from '../config/visualAssets';
import type { GalleryId, GalleryItem } from '../types/game';
import { CharacterDisplay } from './CharacterDisplay';

interface GalleryGridProps {
  unlockedIds: GalleryId[];
}

export function GalleryGrid({ unlockedIds }: GalleryGridProps) {
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);
  const unlockedSet = new Set(unlockedIds);

  return (
    <>
      <div className="gallery-grid">
        {GALLERY_ITEMS.map((item) => {
          const isUnlocked = unlockedSet.has(item.id);
          const image = getVisualAsset(item.visual.type, item.visual.key);

          return (
            <button
              className={`gallery-card ${isUnlocked ? '' : 'gallery-card--locked'}`}
              type="button"
              key={item.id}
              onClick={() => (isUnlocked ? setActiveItem(item) : undefined)}
            >
              <CharacterDisplay image={image} compact />
              <strong>{isUnlocked ? item.name : '未解锁'}</strong>
              <span>{isUnlocked ? '点击查看详情' : item.conditionText}</span>
            </button>
          );
        })}
      </div>

      {activeItem ? (
        <div className="modal-backdrop" role="presentation">
          <section
            className="modal-card gallery-detail"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-detail-title"
          >
            <CharacterDisplay
              image={getVisualAsset(activeItem.visual.type, activeItem.visual.key)}
              caption={activeItem.name}
            />
            <h2 id="gallery-detail-title">{activeItem.name}</h2>
            <p>{activeItem.description}</p>
            <p className="unlock-text">解锁条件：{activeItem.conditionText}</p>
            <button className="button button--primary" type="button" onClick={() => setActiveItem(null)}>
              关闭
            </button>
          </section>
        </div>
      ) : null}
    </>
  );
}
