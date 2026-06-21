import { getVisualAsset } from '../config/visualAssets';
import type { GameFeedback } from '../types/game';
import type { FlowPanelState } from '../types/flow';
import { CharacterDisplay } from './CharacterDisplay';
import { StatChangeList } from './StatChangeList';

interface MonthlySummaryProps {
  panel: FlowPanelState;
  onContinue: () => void;
}

export function MonthlySummary({ panel, onContinue }: MonthlySummaryProps) {
  const { summary } = panel;
  const actionVisual = getFeedbackVisual(summary.actionFeedback);
  const isAutoAdvancing = panel.type === 'autoAdvancing';
  const eyebrow = getEyebrow(panel.type);
  const buttonLabel = panel.type === 'autoAdvancing' ? '推进中...' : panel.continueLabel;

  return (
    <section className={`phase-card phase-card--flow monthly-summary monthly-summary--${panel.type}`}>
      <div className="monthly-summary__header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{summary.title}</h1>
          {summary.subtitle ? <span>{summary.subtitle}</span> : null}
        </div>
      </div>

      {summary.actionFeedback ? (
        <div className="inline-result inline-result--action">
          {actionVisual ? <CharacterDisplay image={actionVisual} compact /> : null}
          <div>
            <strong>{summary.actionFeedback.title}</strong>
            <p>{summary.actionFeedback.message}</p>
          </div>
        </div>
      ) : null}

      {summary.noEventText ? (
        <p className="monthly-summary__line">{summary.noEventText}</p>
      ) : null}

      {summary.eventFeedback ? (
        <div className="inline-result inline-result--event">
          <strong>本月小插曲：{summary.eventFeedback.title}</strong>
          <p>{summary.eventFeedback.message}</p>
        </div>
      ) : null}

      {summary.importantEvent ? (
        <div className="inline-result inline-result--important">
          <strong>本月触发重要事件：{summary.importantEvent.title}</strong>
          <p>{summary.importantEvent.description}</p>
        </div>
      ) : null}

      {summary.actionCounts && summary.actionCounts.length > 0 ? (
        <SummaryCountList title="行动" items={summary.actionCounts} />
      ) : null}

      {summary.eventCounts && summary.eventCounts.length > 0 ? (
        <SummaryCountList title="事件" items={summary.eventCounts} />
      ) : null}

      {summary.changes.length > 0 ? (
        <div className="monthly-summary__changes">
          <span>变化</span>
          <StatChangeList changes={summary.changes} compact limit={8} />
        </div>
      ) : null}

      {summary.stopReason ? (
        <p className="monthly-summary__stop">停下原因：{summary.stopReason}</p>
      ) : null}

      <button
        className="button button--primary"
        type="button"
        disabled={isAutoAdvancing}
        onClick={onContinue}
      >
        {buttonLabel}
      </button>
    </section>
  );
}

function getEyebrow(type: FlowPanelState['type']): string {
  if (type === 'inlineActionResult') {
    return '本月行动结果';
  }

  if (type === 'inlineEventSummary') {
    return '本月事件摘要';
  }

  if (type === 'autoAdvancing') {
    return '自动推进中';
  }

  return '自动推进摘要';
}

function SummaryCountList({
  title,
  items,
}: {
  title: string;
  items: { label: string; count: number }[];
}) {
  return (
    <div className="summary-count-list">
      <span>{title}</span>
      <div>
        {items.map((item) => (
          <em key={item.label}>
            {item.label} ×{item.count}
          </em>
        ))}
      </div>
    </div>
  );
}

function getFeedbackVisual(feedback: GameFeedback | null | undefined) {
  if (!feedback?.visual) {
    return null;
  }

  if (feedback.visual.type !== 'actionVisual') {
    return null;
  }

  return getVisualAsset(feedback.visual.type, feedback.visual.key);
}
