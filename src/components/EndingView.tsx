import { GALLERY_ITEMS } from '../config/gallery';
import { getVisualAsset } from '../config/visualAssets';
import type { EndingConfig, GameState } from '../types/game';
import { formatYearMonth } from '../utils/dateDisplay';
import { getHighestResult } from '../utils/endingLogic';
import { getNodeResultLabel } from '../utils/resultDisplay';
import { getTopRoutes } from '../utils/routeLogic';
import { CharacterDisplay } from './CharacterDisplay';

interface EndingViewProps {
  ending: EndingConfig;
  state: GameState;
  unlockedCount: number;
}

export function EndingView({ ending, state, unlockedCount }: EndingViewProps) {
  const bestB50 = getHighestResult(state.b50Results);
  const bestElection = getHighestResult(state.electionResults);
  const finalB50 = state.b50Results[state.b50Results.length - 1];
  const finalElection = state.electionResults[state.electionResults.length - 1];
  const routeTendency =
    getTopRoutes(state, 2)
      .map((route) => route.label)
      .join(' / ') || '未定';

  return (
    <section className="ending-view">
      <CharacterDisplay image={getVisualAsset('endingCg', ending.endingCgKey)} caption="结局 CG" />
      <div className="panel ending-card">
        <p className="eyebrow">2015-2025 偶像生涯终章</p>
        <h1>{ending.title}</h1>
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
            <span>最终总选</span>
            <strong>{finalElection ? getNodeResultLabel(finalElection, 'election') : '无'}</strong>
          </div>
          <div>
            <span>最终 B50</span>
            <strong>{finalB50 ? getNodeResultLabel(finalB50, 'b50') : '无'}</strong>
          </div>
          <div>
            <span>最高总选</span>
            <strong>{bestElection ? getNodeResultLabel(bestElection, 'election') : '无'}</strong>
          </div>
          <div>
            <span>最高 B50</span>
            <strong>{bestB50 ? getNodeResultLabel(bestB50, 'b50') : '无'}</strong>
          </div>
          <div>
            <span>路线倾向</span>
            <strong>{routeTendency}</strong>
          </div>
          <div>
            <span>图鉴解锁</span>
            <strong>{unlockedCount} / {GALLERY_ITEMS.length}</strong>
          </div>
          <div>
            <span>完成年份</span>
            <strong>{state.yearSummaries.length} / 11</strong>
          </div>
          <div>
            <span>最终时间</span>
            <strong>{formatYearMonth(state.currentYear, state.currentMonth)}</strong>
          </div>
        </div>
        <p className="final-line">{ending.finalLine}</p>
      </div>
    </section>
  );
}
