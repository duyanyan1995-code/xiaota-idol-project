import { ActionPanel } from '../components/ActionPanel';
import { CharacterDisplay } from '../components/CharacterDisplay';
import { MonthlySummary } from '../components/MonthlySummary';
import { StatPanel } from '../components/StatPanel';
import { StatChangeList } from '../components/StatChangeList';
import { YearTimeline } from '../components/YearTimeline';
import { isFinalCareerMonth } from '../config/annualCalendar';
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
import type { FlowPanelState } from '../types/flow';
import {
  getCurrentYearSummary,
  getMonthLabel,
  getPhaseLabel,
  isEventPhase,
} from '../utils/gameLogic';
import { formatGameYearLabel } from '../utils/dateDisplay';
import { getFeedbackNodeResultLabel, getNodeResultLabel } from '../utils/resultDisplay';

interface GamePageProps {
  state: GameState;
  lastPlanId: PlanId | null;
  lastResult: GameFeedback | null;
  activeFeedback: GameFeedback | null;
  flowPanel: FlowPanelState | null;
  isAutoAdvancing: boolean;
  pendingEvent: RandomEventConfig | null;
  onAdvancePhase: () => void;
  onPlan: (planId: PlanId) => void;
  onAutoAdvance: () => void;
  onEventChoice: (choice: RandomEventChoice) => void;
  onResolveNode: () => void;
  onCloseFeedback: () => void;
  onContinueFlow: () => void;
  onHome: () => void;
  onRestart: () => void;
}

export function GamePage({
  state,
  lastPlanId,
  lastResult,
  activeFeedback,
  flowPanel,
  isAutoAdvancing,
  pendingEvent,
  onAdvancePhase,
  onPlan,
  onAutoAdvance,
  onEventChoice,
  onResolveNode,
  onCloseFeedback,
  onContinueFlow,
  onHome,
  onRestart,
}: GamePageProps) {
  const yearSummary = getCurrentYearSummary(state);
  const recentChanges = activeFeedback?.changes ?? flowPanel?.summary.changes ?? null;

  return (
    <main className="page game-page">
      <TopStatusBar state={state} onHome={onHome} onRestart={onRestart} />
      <YearTimeline state={state} />
      <StatPanel state={state} recentChanges={recentChanges} />
      {flowPanel ? (
        <MonthlySummary panel={flowPanel} onContinue={onContinueFlow} />
      ) : (
        <PhaseCard
          state={state}
          lastPlanId={lastPlanId}
          lastResult={lastResult}
          pendingEvent={pendingEvent}
          yearSummary={yearSummary}
          isAutoAdvancing={isAutoAdvancing}
          onAdvancePhase={onAdvancePhase}
          onPlan={onPlan}
          onAutoAdvance={onAutoAdvance}
          onEventChoice={onEventChoice}
          onResolveNode={onResolveNode}
        />
      )}
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
        <strong>{formatGameYearLabel(state.year)}</strong>
        <span>{getMonthLabel(state)} · {getPhaseLabel(state.phase)} · {getCareerStageLabel(state.year)}</span>
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
  isAutoAdvancing,
  onAdvancePhase,
  onPlan,
  onAutoAdvance,
  onEventChoice,
  onResolveNode,
}: {
  state: GameState;
  pendingEvent: RandomEventConfig | null;
  yearSummary: YearSummary | null;
  lastPlanId: PlanId | null;
  lastResult: GameFeedback | null;
  isAutoAdvancing: boolean;
  onAdvancePhase: () => void;
  onPlan: (planId: PlanId) => void;
  onAutoAdvance: () => void;
  onEventChoice: (choice: RandomEventChoice) => void;
  onResolveNode: () => void;
}) {
  if (state.phase === 'monthStart') {
    return (
      <section className="phase-card">
        <p className="eyebrow">月份开始</p>
        <h1>{getMonthLabel(state)}</h1>
        <p>新的偶像日程开始了。这个月要安排一次行动，再看看会发生什么事件。</p>
        <button className="button button--primary" type="button" disabled={isAutoAdvancing} onClick={onAdvancePhase}>
          安排本月行动
        </button>
        <button className="button button--ghost" type="button" disabled={isAutoAdvancing} onClick={onAutoAdvance}>
          {isAutoAdvancing ? '推进中...' : '自动推进到下个关键节点'}
        </button>
      </section>
    );
  }

  if (state.phase === 'monthlyPlan') {
    return (
      <section className="phase-card phase-card--plan">
        <h1>本月行动</h1>
        <p className="plan-subtitle">选择一个方向陪小獭度过这个月</p>
        <ActionPanel state={state} disabled={isAutoAdvancing} onPlan={onPlan} />
        <button
          className="button button--ghost button--auto-advance"
          type="button"
          disabled={isAutoAdvancing}
          onClick={onAutoAdvance}
        >
          {isAutoAdvancing ? '推进中...' : '自动推进到下个关键节点'}
        </button>
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
        <p className="eyebrow">配置月份节点</p>
        <h1>总选 / 年度人气</h1>
        <p>结算本年度到当前月份积累的粉丝支持。评分参考粉丝数、核心应援力、影响力、魅力、资源和事件加成。</p>
        <button className="button button--primary" type="button" onClick={onResolveNode}>
          结算总选
        </button>
      </section>
    );
  }

  if (state.phase === 'b50') {
    return (
      <section className="phase-card">
        <p className="eyebrow">配置月份节点</p>
        <h1>B50 / 舞台记忆</h1>
        <p>结算本年度积累的舞台记忆。评分参考舞台力、唱功、舞蹈、核心应援力、影响力和事件加成。</p>
        <button className="button button--primary" type="button" onClick={onResolveNode}>
          结算 B50
        </button>
      </section>
    );
  }

  if (state.phase === 'yearSummary') {
    return (
      <section className="phase-card phase-card--summary">
        <div className="year-summary-scroll">
          <YearSummaryPanel state={state} summary={yearSummary} />
        </div>
        <button className="button button--primary" type="button" onClick={onAdvancePhase}>
          {isFinalCareerMonth(state.currentYear, state.currentMonth) ? '进入终章结算' : '进入下一年'}
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

function YearSummaryPanel({
  state,
  summary,
}: {
  state: GameState;
  summary: YearSummary | null;
}) {
  if (!summary) {
    return (
      <div className="year-summary-content">
        <p className="eyebrow">年度总结</p>
        <h1>这一年的记录正在整理中</h1>
      </div>
    );
  }

  const electionResult = state.electionResults.find(
    (result) => result.currentYear === summary.currentYear,
  );
  const b50Result = state.b50Results.find((result) => result.currentYear === summary.currentYear);

  return (
    <div className="year-summary-content">
      <p className="eyebrow">{summary.currentYear} 年年度总结 · {summary.careerStage}</p>
      <h1 className="year-summary-title">{summary.routeHint}</h1>
      <div className="summary-list">
        <div>
          <span>本年行动</span>
          <strong>{summary.planNames.length} 次</strong>
        </div>
        <div>
          <span>总选结果</span>
          <strong>{getNodeResultLabel(electionResult, 'election', summary.electionGrade)}</strong>
        </div>
        <div>
          <span>B50 结果</span>
          <strong>{getNodeResultLabel(b50Result, 'b50', summary.b50Grade)}</strong>
        </div>
      </div>
      <p className="summary-events">
        行动：{summary.planNames.length > 0 ? summary.planNames.slice(0, 4).join(' / ') : '无'}
        {summary.planNames.length > 4 ? ' / ...' : ''}
      </p>
      <p className="summary-events">
        事件：{summary.eventTitles.length > 0 ? summary.eventTitles.join(' / ') : '无'}
      </p>
      {summary.growthSummary.length > 0 ? (
        <StatChangeList changes={summary.growthSummary} compact limit={6} />
      ) : null}
    </div>
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
  const nodeResultLabel = getFeedbackNodeResultLabel(feedback);
  const visibleDetails = (feedback.details ?? []).filter((detail) => !detail.startsWith('档位 '));
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
            {nodeResultLabel ? `结果：${nodeResultLabel}` : `${feedback.score} 分`}
          </p>
        ) : null}
        <p className="result-message">{feedback.message}</p>
        {visibleDetails.length > 0 ? (
          <div className="detail-list">
            {visibleDetails.map((detail) => (
              <span key={detail}>{detail}</span>
            ))}
          </div>
        ) : null}
        <StatChangeList changes={feedback.changes} />
        <button className="button button--primary" type="button" onClick={onClose}>
          继续
        </button>
      </section>
    </div>
  );
}

function getCrisisImage(state: GameState): CharacterImageKey | null {
  if (state.stamina < 30 || state.mood < 30 || state.pressure >= 85) {
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

  if (feedback.suppressFallbackVisual) {
    return null;
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
