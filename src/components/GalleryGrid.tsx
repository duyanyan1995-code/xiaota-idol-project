import { useState } from 'react';
import { GALLERY_ITEMS } from '../config/gallery';
import { getVisualAsset } from '../config/visualAssets';
import type { GalleryId, GalleryItem } from '../types/game';
import { CharacterDisplay } from './CharacterDisplay';

interface GalleryGridProps {
  unlockedIds: GalleryId[];
}

const GALLERY_CATEGORIES: Array<{
  id: GalleryItem['category'];
  title: string;
  description: string;
}> = [
  {
    id: 'character',
    title: '小獭状态',
    description: '日常状态和旧版形象记录',
  },
  {
    id: 'event',
    title: '事件回忆',
    description: '完成剧情事件后解锁的回忆 CG',
  },
  {
    id: 'timeline',
    title: '年度主题',
    description: '固定年度节点触发后收录的成长 CG',
  },
  {
    id: 'work',
    title: '作品记忆',
    description: '年度作品达到高光后收录的视觉记忆',
  },
  {
    id: 'annual',
    title: '年度节点',
    description: '总选和 B50 相关视觉预留',
  },
  {
    id: 'ending',
    title: '结局相册',
    description: '达成终章结局后收录的结局 CG',
  },
];

export function GalleryGrid({ unlockedIds }: GalleryGridProps) {
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);
  const unlockedSet = new Set(unlockedIds);

  return (
    <>
      <div className="gallery-sections">
        {GALLERY_CATEGORIES.map((category) => {
          const items = GALLERY_ITEMS.filter((item) => item.category === category.id).sort(
            (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
          );
          if (items.length === 0) {
            return null;
          }

          return (
            <section className="gallery-section" key={category.id}>
              <header className="gallery-section__header">
                <h2>{category.title}</h2>
                <span>{category.description}</span>
              </header>
              <div className="gallery-grid">
                {items.map((item) => {
                  const isUnlocked = unlockedSet.has(item.id) && item.assetReady !== false;
                  const image = getVisualAsset(item.visual.type, item.visual.key);

                  return (
                    <button
                      className={`gallery-card ${isUnlocked ? '' : 'gallery-card--locked'}`}
                      type="button"
                      key={item.id}
                      onClick={() => (isUnlocked ? setActiveItem(item) : undefined)}
                    >
                      {isUnlocked ? (
                        <CharacterDisplay image={image} compact />
                      ) : (
                        <div className="gallery-card__locked-visual" aria-hidden="true">
                          <span>LOCK</span>
                        </div>
                      )}
                      <strong>{isUnlocked ? item.name : item.lockedTitle ?? '未解锁'}</strong>
                      <span>{isUnlocked ? '点击查看详情' : item.lockedHint ?? item.conditionText}</span>
                    </button>
                  );
                })}
              </div>
            </section>
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
              zoomable
              zoomTitle={activeItem.name}
              zoomDescription={activeItem.description}
              showZoomHint
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
