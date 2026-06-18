import { CHARACTER_IMAGES } from '../config/characterImages';
import { CharacterDisplay } from '../components/CharacterDisplay';

interface HomePageProps {
  hasSave: boolean;
  savedProgress: string | null;
  onStart: () => void;
  onContinue: () => void;
  onOpenGallery: () => void;
  onOpenGuide: () => void;
}

export function HomePage({
  hasSave,
  savedProgress,
  onStart,
  onContinue,
  onOpenGallery,
  onOpenGuide,
}: HomePageProps) {
  return (
    <main className="page home-page">
      <section className="home-hero">
        <div className="home-copy">
          <p className="eyebrow">粉丝向 Q 版偶像养成 Demo</p>
          <h1>杨小獭偶像养成计划</h1>
          <p>从 2015 到 2025，每月陪小獭安排行动、经历事件、冲击总选和 B50。</p>
          {savedProgress ? <p className="save-progress">当前进度：{savedProgress}</p> : null}
        </div>
        <CharacterDisplay image={CHARACTER_IMAGES.base} caption="杨小獭" />
      </section>

      <section className="home-actions" aria-label="主页操作">
        <button className="button button--primary" type="button" onClick={onStart}>
          开始新游戏
        </button>
        <button className="button button--secondary" type="button" onClick={onContinue} disabled={!hasSave}>
          继续游戏
        </button>
        <button className="button button--ghost" type="button" onClick={onOpenGallery}>
          图鉴
        </button>
        <button className="button button--ghost" type="button" onClick={onOpenGuide}>
          玩法说明
        </button>
      </section>
    </main>
  );
}
