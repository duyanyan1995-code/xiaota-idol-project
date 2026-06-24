import { GALLERY_ITEMS } from '../config/gallery';
import { getVisualAsset } from '../config/visualAssets';
import type { EndingResult, GameState, WorkResult } from '../types/game';
import { formatYearMonth } from '../utils/dateDisplay';
import { getNodeResultLabel } from '../utils/resultDisplay';
import { CharacterDisplay } from './CharacterDisplay';

interface EndingViewProps {
  ending: EndingResult;
  state: GameState;
  unlockedCount: number;
}

export function EndingView({ ending, state, unlockedCount }: EndingViewProps) {
  const flame = state.workResults.find((result) => result.workId === 'flame') ?? null;
  const finalElection = state.finalElectionResult;
  const endingGalleryItem = ending.unlockedGalleryId
    ? GALLERY_ITEMS.find((item) => item.id === ending.unlockedGalleryId)
    : null;
  const endingVisual = endingGalleryItem
    ? getVisualAsset(endingGalleryItem.visual.type, endingGalleryItem.visual.key)
    : null;
  const sWorks = getWorksAtLeast(state.workResults, 'S');
  const asWorks = getWorksAtLeast(state.workResults, 'A');
  const bestElection = getBestNodeLabel(state.electionResults, 'election');
  const bestB50 = getBestNodeLabel(state.b50Results, 'b50');

  return (
    <section className="ending-view">
      {endingVisual ? (
        <CharacterDisplay
          image={endingVisual}
          caption={`${ending.title} CG`}
          zoomable
          zoomTitle={`${ending.title} CG`}
          zoomDescription={ending.narrative}
          showZoomHint
        />
      ) : null}
      <div className="panel ending-card">
        <p className="eyebrow">2026 FLAME 终章 · {ending.endingType} 结局</p>
        <h1>{ending.title}</h1>
        {ending.subtitle ? <p className="route-tag">{ending.subtitle}</p> : null}
        <p>{ending.narrative}</p>
        <div className="ending-stats">
          <div>
            <span>最终总选</span>
            <strong>{finalElection?.resultLabel ?? '未结算'}</strong>
          </div>
          <div>
            <span>FLAME</span>
            <strong>{flame ? `${flame.grade} · ${flame.resultLabel}` : '未结算'}</strong>
          </div>
          <div>
            <span>A/S 作品</span>
            <strong>{asWorks.length} 个</strong>
          </div>
          <div>
            <span>S 作品</span>
            <strong>{sWorks.length > 0 ? sWorks.map((work) => work.title).join(' / ') : '暂无'}</strong>
          </div>
          <div>
            <span>最高总选</span>
            <strong>{bestElection}</strong>
          </div>
          <div>
            <span>最高 B50</span>
            <strong>{bestB50}</strong>
          </div>
          <div>
            <span>图鉴解锁</span>
            <strong>{unlockedCount} / {GALLERY_ITEMS.length}</strong>
          </div>
          <div>
            <span>完成时间</span>
            <strong>{formatYearMonth(state.currentYear, state.currentMonth)}</strong>
          </div>
        </div>
        <div className="ending-reasons">
          <strong>关键达成原因</strong>
          <ul>
            {ending.keyReasons.slice(0, 5).map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
        <p className="final-line">{ending.sourceSummary}</p>
      </div>
    </section>
  );
}

function getWorksAtLeast(results: WorkResult[], target: WorkResult['grade']): WorkResult[] {
  const order: WorkResult['grade'][] = ['C', 'B', 'A', 'S'];
  const targetIndex = order.indexOf(target);

  return results.filter((result) => order.indexOf(result.grade) >= targetIndex);
}

function getBestNodeLabel(
  results: GameState['electionResults'] | GameState['b50Results'],
  type: 'election' | 'b50',
): string {
  if (results.length === 0) {
    return '无';
  }

  const best = [...results].sort((a, b) => b.score - a.score)[0];
  return getNodeResultLabel(best, type);
}
