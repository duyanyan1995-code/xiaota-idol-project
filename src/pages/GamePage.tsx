import { ActionPanel } from '../components/ActionPanel';
import { CharacterDisplay } from '../components/CharacterDisplay';
import { MonthlySummary } from '../components/MonthlySummary';
import { StateStage } from '../components/StateStage';
import { StatPanel } from '../components/StatPanel';
import { StatChangeList } from '../components/StatChangeList';
import { YearTimeline } from '../components/YearTimeline';
import { isFinalCareerMonth } from '../config/annualCalendar';
import { GALLERY_ITEMS } from '../config/gallery';
import { STAT_CONFIG_BY_ID } from '../config/stats';
import { getVisualAsset } from '../config/visualAssets';
import type {
  CharacterImageKey,
  GameFeedback,
  GameState,
  PlanId,
  RandomEventChoice,
  RandomEventConfig,
  StatChange,
  StatDeltas,
  StatKey,
  ThemeNodeResult,
  VisualUnlock,
  WorkResult,
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
import {
  getFeedbackNodeDisplayLabel,
  getFeedbackNodeStory,
  getNodeResultLabel,
} from '../utils/resultDisplay';

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
  const viewMode = getGameViewMode(state, flowPanel);

  return (
    <main className={`page game-page game-page--${viewMode}`}>
      <TopStatusBar state={state} onHome={onHome} onRestart={onRestart} />
      <YearTimeline state={state} />
      <StatPanel state={state} recentChanges={recentChanges} />
      <StateStage state={state} />
      <section className={`interaction-layer interaction-layer--${viewMode}`} aria-label="流程交互区">
        {flowPanel ? (
          <MonthlySummary
            lastPlanId={lastPlanId}
            panel={flowPanel}
            state={state}
            onContinue={onContinueFlow}
          />
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
      </section>
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
  if (state.pendingVisualUnlock) {
    return (
      <VisualUnlockCard unlock={state.pendingVisualUnlock} onContinue={onAdvancePhase} />
    );
  }

  if (state.phase === 'monthStart') {
    return (
      <section className="phase-actions phase-actions--month-start" aria-label="月份操作">
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
      <section className="interaction-panel phase-card phase-card--plan">
        <div className="interaction-panel__header plan-heading">
          <h1>本月行动</h1>
          <p className="plan-subtitle">选择一个方向陪小獭度过这个月</p>
        </div>
        <div className="interaction-panel__body interaction-panel__body--action-select">
          <ActionPanel state={state} disabled={isAutoAdvancing} onPlan={onPlan} />
        </div>
        <div className="interaction-panel__footer">
          <button
            className="button button--ghost button--auto-advance"
            type="button"
            disabled={isAutoAdvancing}
            onClick={onAutoAdvance}
          >
            {isAutoAdvancing ? '推进中...' : '自动推进到下个关键节点'}
          </button>
        </div>
      </section>
    );
  }

  if (isEventPhase(state.phase)) {
    return (
      <EventCard event={pendingEvent} onEventChoice={onEventChoice} />
    );
  }

  if (state.phase === 'themeNode') {
    return (
      <ThemeNodeCard result={state.pendingThemeNodeResult} onContinue={onAdvancePhase} />
    );
  }

  if (state.phase === 'workNode') {
    return (
      <WorkNodeCard result={state.pendingWorkResult} onContinue={onAdvancePhase} />
    );
  }

  if (state.phase === 'election') {
    return (
      <section className="interaction-panel phase-card">
        <div className="interaction-panel__header">
          <p className="eyebrow">配置月份节点</p>
          <h1>总选 / 年度人气</h1>
        </div>
        <div className="interaction-panel__body">
          <p>结算本年度到当前月份积累的粉丝支持。评分参考粉丝数、核心应援力、影响力、魅力、资源和事件加成。</p>
        </div>
        <div className="interaction-panel__footer">
          <button className="button button--primary" type="button" onClick={onResolveNode}>
            结算总选
          </button>
        </div>
      </section>
    );
  }

  if (state.phase === 'b50') {
    return (
      <section className="interaction-panel phase-card">
        <div className="interaction-panel__header">
          <p className="eyebrow">配置月份节点</p>
          <h1>B50 / 舞台记忆</h1>
        </div>
        <div className="interaction-panel__body">
          <p>结算本年度积累的舞台记忆。评分参考舞台力、唱功、舞蹈、核心应援力、影响力和事件加成。</p>
        </div>
        <div className="interaction-panel__footer">
          <button className="button button--primary" type="button" onClick={onResolveNode}>
            结算 B50
          </button>
        </div>
      </section>
    );
  }

  if (state.phase === 'finalElection') {
    return (
      <section className="interaction-panel phase-card phase-card--final-election">
        <div className="interaction-panel__header">
          <p className="eyebrow">FLAME 终章节点</p>
          <h1>最终总选 / 终章总选</h1>
        </div>
        <div className="interaction-panel__body">
          <p>
            结算 2015—2026 的完整养成结果。最终总选会参考粉丝数、核心应援力、
            影响力、资源、舞台力、运营力、FLAME 等级和长期里程碑。
          </p>
        </div>
        <div className="interaction-panel__footer">
          <button className="button button--primary" type="button" onClick={onResolveNode}>
            开始最终总选
          </button>
        </div>
      </section>
    );
  }

  if (state.phase === 'yearSummary') {
    return (
      <section className="interaction-panel phase-card phase-card--summary">
        <div className="interaction-panel__body year-summary-scroll">
          <YearSummaryPanel state={state} summary={yearSummary} />
        </div>
        <div className="interaction-panel__footer">
          <button className="button button--primary" type="button" onClick={onAdvancePhase}>
            {isFinalCareerMonth(state.currentYear, state.currentMonth) ? '进入 2026 FLAME 终章' : '进入下一年'}
          </button>
        </div>
      </section>
    );
  }

  if (state.phase === 'flamePrelude') {
    return (
      <section className="interaction-panel phase-card phase-card--flame-prelude">
        <div className="interaction-panel__header">
          <p className="eyebrow">V4 终章</p>
          <h1>即将进入 2026 FLAME 终章</h1>
        </div>
        <div className="interaction-panel__body">
          <p>
            2015—2025 的主养成期已经完成。接下来进入 2026 终章准备期：
            1 月到 5 月仍可行动，6 月触发 FLAME，随后进入最终总选与结局判定。
          </p>
        </div>
        <div className="interaction-panel__footer">
          <button className="button button--primary" type="button" onClick={onAdvancePhase}>
            进入终章准备
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="interaction-panel phase-card">
      <div className="interaction-panel__header">
        <p className="eyebrow">最近反馈</p>
        <h1>{lastResult?.title ?? '准备中'}</h1>
      </div>
      <div className="interaction-panel__body">
        <p>{lastResult?.message ?? '小獭正在整理下一步日程。'}</p>
        <p>{lastPlanId ? `上一项计划：${lastPlanId}` : '等待下一阶段。'}</p>
      </div>
    </section>
  );
}

function VisualUnlockCard({
  unlock,
  onContinue,
}: {
  unlock: VisualUnlock;
  onContinue: () => void;
}) {
  const galleryItem = GALLERY_ITEMS.find((item) => item.id === unlock.galleryId);
  const visual = galleryItem ? getVisualAsset(galleryItem.visual.type, galleryItem.visual.key) : null;

  return (
    <section className="interaction-panel phase-card visual-unlock-panel" aria-label="视觉记忆解锁">
      <div className="interaction-panel__header">
        <p className="eyebrow">新的记忆已收录</p>
        <h1>{unlock.title}</h1>
      </div>
      <div className="interaction-panel__body visual-unlock-panel__body">
        {visual ? (
          <CharacterDisplay
            image={visual}
            caption={unlock.title}
            zoomable
            zoomTitle={unlock.title}
            zoomDescription={unlock.description}
            showZoomHint
          />
        ) : (
          <div className="visual-unlock-placeholder">
            <span>视觉资源待补充</span>
          </div>
        )}
        <p>{unlock.description}</p>
        <p className="node-meta">
          来源：{getVisualSourceLabel(unlock.sourceType)}
          {unlock.grade ? ` · ${unlock.grade} 级作品` : ''}
          {' · '}
          {unlock.currentYear} 年 {unlock.month} 月
        </p>
        <p className="work-milestone-note">已加入图鉴</p>
      </div>
      <div className="interaction-panel__footer">
        <button className="button button--primary" type="button" onClick={onContinue}>
          继续
        </button>
      </div>
    </section>
  );
}

function getVisualSourceLabel(sourceType: VisualUnlock['sourceType']): string {
  if (sourceType === 'work') {
    return '年度作品';
  }

  if (sourceType === 'timeline') {
    return '年度主题';
  }

  if (sourceType === 'annual') {
    return '年度节点';
  }

  if (sourceType === 'ending') {
    return '终章';
  }

  return '事件';
}

function ThemeNodeCard({
  result,
  onContinue,
}: {
  result: ThemeNodeResult | null;
  onContinue: () => void;
}) {
  return (
    <section className="interaction-panel phase-card phase-card--theme-node">
      <div className="interaction-panel__header">
        <p className="eyebrow">年度主题节点</p>
        <h1>{result?.title ?? '年度主题节点'}</h1>
      </div>
      <div className="interaction-panel__body">
        <p className="node-meta">{result ? `${result.currentYear} 年 ${result.month} 月` : '节点记录整理中'}</p>
        <p>{result?.narrative ?? '这一年的重要记忆正在整理。'}</p>
        {result && Object.keys(result.deltas).length > 0 ? (
          <StatChangeList changes={deltasToChanges(result.deltas)} compact />
        ) : null}
      </div>
      <div className="interaction-panel__footer">
        <button className="button button--primary" type="button" onClick={onContinue}>
          继续
        </button>
      </div>
    </section>
  );
}

function WorkNodeCard({
  result,
  onContinue,
}: {
  result: WorkResult | null;
  onContinue: () => void;
}) {
  return (
    <section className="interaction-panel phase-card phase-card--work-node">
      <div className="interaction-panel__header">
        <p className="eyebrow">年度作品节点</p>
        <h1>{result?.title ?? '年度作品节点'}</h1>
      </div>
      <div className="interaction-panel__body">
        <p className="node-meta">{result ? `${result.currentYear} 年 ${result.month} 月` : '作品记录整理中'}</p>
        {result ? (
          <p className="work-grade-badge">
            结果等级 {result.grade} · {result.resultLabel}
          </p>
        ) : null}
        <p>{result?.theme ?? '这一年的作品节点正在整理。'}</p>
        <p>{result?.narrative ?? null}</p>
        {result && Object.keys(result.deltas).length > 0 ? (
          <StatChangeList changes={deltasToChanges(result.deltas)} compact />
        ) : null}
        {result?.grade === 'A' || result?.grade === 'S' ? (
          <p className="work-milestone-note">
            里程碑：{result.grade === 'S' ? '年度作品高光' : '代表作成形'}
          </p>
        ) : null}
      </div>
      <div className="interaction-panel__footer">
        <button className="button button--primary" type="button" onClick={onContinue}>
          继续
        </button>
      </div>
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
      <section className="interaction-panel phase-card">
        <div className="interaction-panel__header">
          <p className="eyebrow">事件</p>
          <h1>事件准备中</h1>
        </div>
        <div className="interaction-panel__body">
          <p>这一阶段会触发一个简版事件。</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`interaction-panel phase-card phase-card--event phase-card--event-${event.type}`}>
      <div className="interaction-panel__header">
        <p className="eyebrow">{getEventTypeLabel(event.type)}</p>
        <h1>{event.title}</h1>
      </div>
      <div className="interaction-panel__body">
        <p>{event.description}</p>
      </div>
      <div className="interaction-panel__footer choice-list">
        {event.choices.map((choice) => (
          <button
            className="event-choice-button"
            type="button"
            key={choice.id}
            onClick={() => onEventChoice(choice)}
          >
            <strong>{choice.label}</strong>
            {choice.description ? <span>{choice.description}</span> : null}
          </button>
        ))}
      </div>
    </section>
  );
}

function getEventTypeLabel(type: RandomEventConfig['type']): string {
  const labels: Record<RandomEventConfig['type'], string> = {
    positive: '机会事件',
    negative: '波动事件',
    risk: '风险事件',
    recovery: '补救事件',
    milestone: '里程碑事件',
  };

  return labels[type];
}

function deltasToChanges(deltas: StatDeltas): StatChange[] {
  return Object.entries(deltas)
    .map(([key, value]) => {
      const statKey = key as StatKey;
      const delta = value ?? 0;
      const label = STAT_CONFIG_BY_ID[statKey]?.statName ?? key;

      return {
        key: statKey,
        label,
        before: 0,
        after: delta,
        delta,
      };
    })
    .filter((change) => change.delta !== 0);
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
        <StatChangeList changes={summary.growthSummary} compact />
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

  const nodeResultLabel = getFeedbackNodeDisplayLabel(feedback);
  const isNodeResult = Boolean(nodeResultLabel);
  const visualAsset = isNodeResult ? null : getFeedbackVisualAsset(feedback, state);
  const visualType = feedback.visual?.type ?? (feedback.imageKey ? 'legacy' : null);
  const isEventCg = visualType === 'eventCg';
  const nodeStory = getFeedbackNodeStory(feedback);
  const displayTitle =
    isNodeResult && feedback.title.includes('总选') ? '总选 / 年度人气' : feedback.title;
  const visibleDetails = isNodeResult
    ? []
    : (feedback.details ?? []).filter((detail) => !detail.startsWith('档位 '));
  const modalClassName = `modal-card result-modal ${
    isNodeResult
      ? 'result-modal--node-result'
      : isEventCg
        ? 'result-modal--event-cg'
        : 'result-modal--compact-visual'
  }`;

  return (
    <div className="modal-backdrop" role="presentation">
      <section className={modalClassName} role="dialog" aria-modal="true">
        <p className="eyebrow">结果反馈</p>
        {visualAsset ? (
          <CharacterDisplay
            image={visualAsset}
            compact={!isEventCg}
            zoomable
            zoomTitle={displayTitle}
            zoomDescription={nodeStory ?? feedback.message}
            showZoomHint={isEventCg}
          />
        ) : null}
        <h2>{displayTitle}</h2>
        {feedback.score !== undefined ? (
          <p className="result-grade">
            {nodeResultLabel ? `结果：${nodeResultLabel}` : `${feedback.score} 分`}
          </p>
        ) : null}
        <p className="result-message">{nodeStory ?? feedback.message}</p>
        {visibleDetails.length > 0 ? (
          <div className="detail-list">
            {visibleDetails.map((detail) => (
              <span key={detail}>{detail}</span>
            ))}
          </div>
        ) : null}
        <StatChangeList changes={feedback.changes} limit={isNodeResult ? 5 : undefined} />
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

type GameViewMode =
  | 'month-start'
  | 'action-select'
  | 'action-result'
  | 'month-node'
  | 'auto-advance';

function getGameViewMode(state: GameState, flowPanel: FlowPanelState | null): GameViewMode {
  if (flowPanel?.type === 'autoAdvancing' || flowPanel?.type === 'autoAdvanceSummary') {
    return 'auto-advance';
  }

  if (flowPanel?.type === 'inlineActionResult') {
    return 'action-result';
  }

  if (flowPanel?.type === 'inlineEventSummary') {
    return 'month-node';
  }

  if (state.phase === 'monthStart') {
    return 'month-start';
  }

  if (state.phase === 'monthlyPlan') {
    return 'action-select';
  }

  return 'month-node';
}
