import { CHARACTER_IMAGES } from '../config/characterImages';
import { GALLERY_ITEMS } from '../config/gallery';
import type { EndingConfig, GameState } from '../types/game';
import { getHighestResult } from '../utils/endingLogic';
import { CharacterDisplay } from './CharacterDisplay';

interface EndingViewProps {
  ending: EndingConfig;
  state: GameState;
  unlockedCount: number;
}

export function EndingView({ ending, state, unlockedCount }: EndingViewProps) {
  const bestB50 = getHighestResult(state.b50Results);
  const bestElection = getHighestResult(state.electionResults);

  return (
    <section className="ending-view">
      <CharacterDisplay image={CHARACTER_IMAGES.stage} caption="终章结算" />
      <div className="panel ending-card">
        <p className="eyebrow">11 年偶像生涯终章</p>
        <h1>{ending.name}</h1>
        <p className="route-tag">{ending.routeTag}</p>
        <p>{ending.text}</p>
        <div className="ending-stats">
          <div>
            <span>总粉丝数</span>
            <strong>{state.fans}</strong>
          </div>
          <div>
            <span>最终人气</span>
            <strong>{state.popularity}</strong>
          </div>
          <div>
            <span>最高 B50</span>
            <strong>{bestB50 ? `${bestB50.grade} · ${bestB50.score}` : '无'}</strong>
          </div>
          <div>
            <span>最高总选</span>
            <strong>{bestElection ? `${bestElection.grade} · ${bestElection.score}` : '无'}</strong>
          </div>
          <div>
            <span>图鉴解锁</span>
            <strong>{unlockedCount} / {GALLERY_ITEMS.length}</strong>
          </div>
          <div>
            <span>完成年份</span>
            <strong>{state.yearSummaries.length} / 11</strong>
          </div>
        </div>
        <p className="final-line">{ending.finalLine}</p>
      </div>
    </section>
  );
}
