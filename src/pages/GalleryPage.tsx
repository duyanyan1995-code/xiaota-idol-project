import { GalleryGrid } from '../components/GalleryGrid';
import type { CharacterImageKey } from '../types/game';

interface GalleryPageProps {
  unlockedIds: CharacterImageKey[];
  onHome: () => void;
}

export function GalleryPage({ unlockedIds, onHome }: GalleryPageProps) {
  return (
    <main className="page gallery-page">
      <header className="top-bar">
        <button className="button button--small" type="button" onClick={onHome}>
          返回首页
        </button>
        <strong>小獭图鉴</strong>
        <span className="top-bar__spacer" />
      </header>
      <section className="page-heading">
        <p className="eyebrow">角色收集册</p>
        <h1>已解锁 {unlockedIds.length} / 7</h1>
      </section>
      <GalleryGrid unlockedIds={unlockedIds} />
    </main>
  );
}

