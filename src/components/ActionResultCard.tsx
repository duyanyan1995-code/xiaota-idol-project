import { PLAN_BY_ID } from '../config/plans';
import { getVisualAsset } from '../config/visualAssets';
import type { GameFeedback, GameState, PlanHistoryEntry, PlanId } from '../types/game';
import { formatYearMonth } from '../utils/dateDisplay';
import { getActionHighlightLabel } from '../utils/statusStageLogic';
import { CharacterDisplay } from './CharacterDisplay';
import { StatChangeList } from './StatChangeList';

interface ActionResultCardProps {
  feedback: GameFeedback | null | undefined;
  state: GameState;
  planId: PlanId | null;
  compact?: boolean;
}

export function ActionResultCard({
  feedback,
  state,
  planId,
  compact = false,
}: ActionResultCardProps) {
  if (!feedback) {
    return null;
  }

  const historyEntry = getLatestPlanEntry(state, planId);
  const resolvedPlanId = planId ?? historyEntry?.planId ?? null;
  const plan = resolvedPlanId ? PLAN_BY_ID[resolvedPlanId] : null;
  const visualAsset =
    feedback.visual?.type === 'actionVisual'
      ? getVisualAsset(feedback.visual.type, feedback.visual.key)
      : null;
  const highlight = getActionHighlightLabel(resolvedPlanId);
  const variantText = historyEntry?.variantText ?? getVariantFromDetails(feedback);
  const dateText = historyEntry
    ? formatYearMonth(historyEntry.currentYear, historyEntry.currentMonth)
    : formatYearMonth(state.currentYear, state.currentMonth);
  const className = `action-result-card ${compact ? 'action-result-card--compact' : ''}`;

  return (
    <article className={className} aria-label="行动结果">
      <div className="action-result-card__visual">
        {visualAsset ? (
          <CharacterDisplay image={visualAsset} compact={compact} />
        ) : (
          <div className="action-result-card__visual-placeholder">
            <span>行动视觉</span>
            <small>待接入</small>
          </div>
        )}
      </div>
      <div className="action-result-card__body">
        <div className="action-result-card__head">
          <span>{dateText}</span>
          <strong>{plan?.name ?? feedback.title}</strong>
        </div>
        {variantText ? <p>{variantText}</p> : <p>{feedback.message}</p>}
        <div className="action-result-card__tags">
          {highlight ? <em>{highlight}</em> : null}
        </div>
        <StatChangeList changes={feedback.changes} compact />
      </div>
    </article>
  );
}

function getLatestPlanEntry(
  state: GameState,
  planId: PlanId | null,
): PlanHistoryEntry | null {
  const history = [...state.planHistory].reverse();

  if (planId) {
    return history.find((entry) => entry.planId === planId) ?? null;
  }

  return history[0] ?? null;
}

function getVariantFromDetails(feedback: GameFeedback): string | null {
  const detail = feedback.details?.find((item) => item.startsWith('本月行动：'));
  return detail ? detail.replace('本月行动：', '') : null;
}
