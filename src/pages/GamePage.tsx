import { ActionPanel } from '../components/ActionPanel';
import { CharacterDisplay } from '../components/CharacterDisplay';
import { StatPanel } from '../components/StatPanel';
import { getVisualAsset } from '../config/visualAssets';
import type {
  CharacterImageKey,
  GameFeedback,
  GameState,
  PlanId,
  RandomEventChoice,
  RandomEventConfig,
  YearSummary,
} from '../types/game';
import {
  getCurrentYearSummary,
  getPhaseLabel,
  isEventPhase,
} from '../utils/gameLogic';

interface GamePageProps {
  state: GameState;
  lastPlanId: PlanId | null;
  lastResult: GameFeedback | null;
  activeFeedback: GameFeedback | null;
  pendingEvent: RandomEventConfig | null;
  onAdvancePhase: () => void;
  onPlan: (planId: PlanId) => void;
  onEventChoice: (choice: RandomEventChoice) => void;
  onResolveNode: () => void;
  onCloseFeedback: () => void;
  onHome: () => void;
  onRestart: () => void;
}

export function GamePage({
  state,
  lastPlanId,
  lastResult,
  activeFeedback,
  pendingEvent,
  onAdvancePhase,
  onPlan,
  onEventChoice,
  onResolveNode,
  onCloseFeedback,
  onHome,
  onRestart,
}: GamePageProps) {
  const yearSummary = getCurrentYearSummary(state);

  return (
    <main className="page game-page">
      <TopStatusBar state={state} onHome={onHome} onRestart={onRestart} />
      <StatPanel state={state} />
      <PhaseCard
        state={state}
        lastPlanId={lastPlanId}
        lastResult={lastResult}
        pendingEvent={pendingEvent}
        yearSummary={yearSummary}
        onAdvancePhase={onAdvancePhase}
        onPlan={onPlan}
        onEventChoice={onEventChoice}
        onResolveNode={onResolveNode}
      />
      <ResultModal feedback={activeFeedback} state={state} onClose={onCloseFeedback} />
    </main>
  );
}

function TopStatusBar({
  state,
  onHome,
  onRestart,
}: {
  state: GameState;
  onHome: () => void;
  onRestart: () => void;
}) {
  return (
    <header className="game-status-bar">
      <button className="icon-button" type="button" onClick={onHome} aria-label="返回首页">
        首页
      </button>
      <div>
        <strong>Year {state.year} / 11</strong>
        <span>{getPhaseLabel(state.phase)} · {getCareerStageLabel(state.year)}</span>
      </div>
      <button className="icon-button" type="button" onClick={onRestart} aria-label="重新开始">
        重开
      </button>
    </header>
  );
}

function PhaseCard({
  state,
  pendingEvent,
  yearSummary,
  lastPlanId,
  lastResult,
  onAdvancePhase,
  onPlan,
  onEventChoice,
  onResolveNode,
}: {
  state: GameState;
  pendingEvent: RandomEventConfig | null;
  yearSummary: YearSummary | null;
  lastPlanId: PlanId | null;
  lastResult: GameFeedback | null;
  onAdvancePhase: () => void;
  onPlan: (planId: PlanId) => void;
  onEventChoice: (choice: RandomEventChoice) => void;
  onResolveNode: () => void;
}) {
  if (state.phase === 'yearStart') {
    return (
      <section className="phase-card">
        <p className="eyebrow">年度开始</p>
        <h1>第 {state.year} 年</h1>
        <p>新的偶像日程开始了。先安排上半年计划，然后迎接年度人气总选。</p>
        <button className="button button--primary" type="button" onClick={onAdvancePhase}>
          进入上半年计划
        </button>
      </section>
    );
  }

  if (state.phase === 'firstHalfPlan') {
    return (
      <section className="phase-card phase-card--plan">
        <p className="eyebrow">上半年计划</p>
        <h1>冲刺总选前的半年</h1>
        <ActionPanel disabled={false} onPlan={onPlan} />
      </section>
    );
  }

  if (state.phase === 'secondHalfPlan') {
    return (
      <section className="phase-card phase-card--plan">
        <p className="eyebrow">下半年计划</p>
        <h1>为 B50 舞台记忆蓄力</h1>
        <ActionPanel disabled={false} onPlan={onPlan} />
      </section>
    );
  }

  if (isEventPhase(state.phase)) {
    return (
      <EventCard event={pendingEvent} onEventChoice={onEventChoice} />
    );
  }

  if (state.phase === 'election') {
    return (
      <section className="phase-card">
        <p className="eyebrow">上半年节点</p>
        <h1>总选 / 年度人气</h1>
        <p>结算上半年的粉丝支持。评分参考粉丝数、粉丝黏性、人气、魅力、资源和事件加成。</p>
        <button className="button button--primary" type="button" onClick={onResolveNode}>
          结算总选
        </button>
      </section>
    );
  }

  if (state.phase === 'b50') {
    return (
      <section className="phase-card">
        <p className="eyebrow">下半年节点</p>
        <h1>B50 / 舞台记忆</h1>
        <p>结算下半年的舞台表现。评分参考舞台表现、唱功、舞蹈、粉丝黏性、人气和事件加成。</p>
        <button className="button button--primary" type="button" onClick={onResolveNode}>
          结算 B50
        </button>
      </section>
    );
  }

  if (state.phase === 'yearSummary') {
    return (
      <section className="phase-card phase-card--summary">
        <YearSummaryPanel summary={yearSummary} />
        <button className="button button--primary" type="button" onClick={onAdvancePhase}>
          {state.year >= 11 ? '进入终章结算' : '进入下一年'}
        </button>
      </section>
    );
  }

  return (
    <section className="phase-card">
      <p className="eyebrow">最近反馈</p>
      <h1>{lastResult?.title ?? '准备中'}</h1>
      <p>{lastResult?.message ?? '小獭正在整理下一步日程。'}</p>
      <p>{lastPlanId ? `上一项计划：${lastPlanId}` : '等待下一阶段。'}</p>
    </section>
  );
}

function EventCard({
  event,
  onEventChoice,
}: {
  event: RandomEventConfig | null;
  onEventChoice: (choice: RandomEventChoice) => void;
}) {
  if (!event) {
    return (
      <section className="phase-card">
        <p className="eyebrow">事件</p>
        <h1>事件准备中</h1>
        <p>这一阶段会触发一个简版事件。</p>
      </section>
    );
  }

  return (
    <section className="phase-card phase-card--event">
      <div>
        <p className="eyebrow">阶段事件</p>
        <h1>{event.title}</h1>
      </div>
      <p>{event.description}</p>
      <div className="choice-list">
        {event.choices.map((choice) => (
          <button
            className="button button--primary"
            type="button"
            key={choice.id}
            onClick={() => onEventChoice(choice)}
          >
            {choice.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function YearSummaryPanel({ summary }: { summary: YearSummary | null }) {
  if (!summary) {
    return (
      <>
        <p className="eyebrow">年度总结</p>
        <h1>这一年的记录正在整理中</h1>
      </>
    );
  }

  return (
    <>
      <p className="eyebrow">第 {summary.year} 年年度总结 · {summary.careerStage}</p>
      <h1>{summary.routeHint}</h1>
      <div className="summary-list">
        <div>
          <span>上半年计划</span>
          <strong>{summary.firstPlanName}</strong>
        </div>
        <div>
          <span>总选结果</span>
          <strong>
            {summary.electionGrade} · {summary.electionScore}
          </strong>
        </div>
        <div>
          <span>下半年计划</span>
          <strong>{summary.secondPlanName}</strong>
        </div>
        <div>
          <span>B50 结果</span>
          <strong>
            {summary.b50Grade} · {summary.b50Score}
          </strong>
        </div>
      </div>
      <p className="summary-events">
        事件：{summary.eventTitles.length > 0 ? summary.eventTitles.join(' / ') : '无'}
      </p>
      {summary.growthSummary.length > 0 ? (
        <div className="change-list change-list--compact">
          {summary.growthSummary.slice(0, 6).map((change) => (
            <span className={change.delta >= 0 ? 'change-up' : 'change-down'} key={change.key}>
              {change.label} {change.delta >= 0 ? '+' : ''}
              {change.delta}
            </span>
          ))}
        </div>
      ) : null}
    </>
  );
}

function ResultModal({
  feedback,
  state,
  onClose,
}: {
  feedback: GameFeedback | null;
  state: GameState;
  onClose: () => void;
}) {
  if (!feedback) {
    return null;
  }

  const visualAsset = getFeedbackVisualAsset(feedback, state);
  const visualType = feedback.visual?.type ?? (feedback.imageKey ? 'legacy' : null);
  const isEventCg = visualType === 'eventCg';
  const modalClassName = `modal-card result-modal ${
    isEventCg ? 'result-modal--event-cg' : 'result-modal--compact-visual'
  }`;

  return (
    <div className="modal-backdrop" role="presentation">
      <section className={modalClassName} role="dialog" aria-modal="true">
        <p className="eyebrow">结果反馈</p>
        {visualAsset ? <CharacterDisplay image={visualAsset} compact={!isEventCg} /> : null}
        <h2>{feedback.title}</h2>
        {feedback.score !== undefined ? (
          <p className="result-grade">
            {feedback.grade ? `${feedback.grade} · ` : ''}
            {feedback.score} 分
          </p>
        ) : null}
        <p className="result-message">{feedback.message}</p>
        {feedback.details && feedback.details.length > 0 ? (
          <div className="detail-list">
            {feedback.details.map((detail) => (
              <span key={detail}>{detail}</span>
            ))}
          </div>
        ) : null}
        {feedback.changes.length > 0 ? (
          <div className="change-list">
            {feedback.changes.map((change) => (
              <span
                className={
                  change.delta >= 0
                    ? 'change-up stat-change-up'
                    : 'change-down stat-change-down'
                }
                key={change.key}
              >
                {change.label} {change.delta >= 0 ? '+' : ''}
                {change.delta}
              </span>
            ))}
          </div>
        ) : null}
        <button className="button button--primary" type="button" onClick={onClose}>
          继续
        </button>
      </section>
    </div>
  );
}

function getCrisisImage(state: GameState): CharacterImageKey | null {
  if (state.energy < 30 || state.mood < 30 || state.stress >= 85) {
    return 'tired';
  }

  return null;
}

function getFeedbackVisualAsset(feedback: GameFeedback, state: GameState) {
  if (feedback.visual) {
    return getVisualAsset(feedback.visual.type, feedback.visual.key);
  }

  if (feedback.imageKey) {
    return getVisualAsset('legacy', feedback.imageKey);
  }

  const crisisImage = getCrisisImage(state);
  return crisisImage ? getVisualAsset('legacy', crisisImage) : null;
}

function getCareerStageLabel(year: number): string {
  if (year <= 2) {
    return '新人期';
  }

  if (year <= 5) {
    return '成长期';
  }

  if (year <= 8) {
    return '突破期';
  }

  if (year <= 10) {
    return '成熟期';
  }

  return '终章年';
}
