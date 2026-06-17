import { ActionPanel } from '../components/ActionPanel';
import { CharacterDisplay } from '../components/CharacterDisplay';
import { EventModal } from '../components/EventModal';
import { StatPanel } from '../components/StatPanel';
import type {
  ActionId,
  GameFeedback,
  GameState,
  RandomEventChoice,
  RandomEventConfig,
} from '../types/game';
import { getCharacterImage } from '../utils/gameLogic';

interface GamePageProps {
  state: GameState;
  lastActionId: ActionId | null;
  lastResult: GameFeedback | null;
  pendingEvent: RandomEventConfig | null;
  onAction: (actionId: ActionId) => void;
  onEventChoice: (choice: RandomEventChoice) => void;
  onHome: () => void;
  onRestart: () => void;
}

export function GamePage({
  state,
  lastActionId,
  lastResult,
  pendingEvent,
  onAction,
  onEventChoice,
  onHome,
  onRestart,
}: GamePageProps) {
  const image = getCharacterImage(state, lastActionId);

  return (
    <main className="page game-page">
      <header className="top-bar">
        <button className="button button--small" type="button" onClick={onHome}>
          返回首页
        </button>
        <strong>第 {state.day} 天</strong>
        <button className="button button--small" type="button" onClick={onRestart}>
          重新开始
        </button>
      </header>

      <section className="game-stage">
        <CharacterDisplay image={image} caption={image.label} />
      </section>

      <StatPanel state={state} />
      <ActionPanel disabled={Boolean(pendingEvent)} onAction={onAction} />
      <ResultPanel result={lastResult} />
      <EventModal event={pendingEvent} onChoose={onEventChoice} />
    </main>
  );
}

function ResultPanel({ result }: { result: GameFeedback | null }) {
  return (
    <section className="panel result-panel" aria-label="最近一次行动结果">
      <div className="section-title">
        <span>最近反馈</span>
        {result?.score !== undefined ? <strong>评分 {result.score}</strong> : null}
      </div>
      {result ? (
        <>
          <h2>{result.title}</h2>
          <p>{result.message}</p>
          {result.changes.length > 0 ? (
            <div className="change-list">
              {result.changes.map((change) => (
                <span className={change.delta >= 0 ? 'change-up' : 'change-down'} key={change.key}>
                  {change.label} {change.delta >= 0 ? '+' : ''}
                  {change.delta}
                </span>
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <p>今天的小獭正在等你安排第一项行动。</p>
      )}
    </section>
  );
}

