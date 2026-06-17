import { EndingView } from '../components/EndingView';
import type { EndingConfig, GameState } from '../types/game';

interface EndingPageProps {
  ending: EndingConfig;
  state: GameState;
  onHome: () => void;
  onRestart: () => void;
  onGallery: () => void;
}

export function EndingPage({ ending, state, onHome, onRestart, onGallery }: EndingPageProps) {
  return (
    <main className="page ending-page">
      <EndingView ending={ending} state={state} />
      <section className="home-actions">
        <button className="button button--primary" type="button" onClick={onRestart}>
          再来一次
        </button>
        <button className="button button--secondary" type="button" onClick={onGallery}>
          查看图鉴
        </button>
        <button className="button button--ghost" type="button" onClick={onHome}>
          返回首页
        </button>
      </section>
    </main>
  );
}

