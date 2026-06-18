import { PLANS } from '../config/plans';
import type { PlanConfig, PlanId, StatKey } from '../types/game';

const STAT_LABELS: Record<StatKey, string> = {
  vocal: '唱功',
  dance: '舞蹈',
  performance: '舞台表现',
  fanLoyalty: '粉丝粘性',
  charm: '魅力',
  popularity: '人气',
  fans: '粉丝数',
  energy: '体力',
  mood: '心情',
  stress: '压力',
  resources: '资源',
  style: '风格',
};

interface ActionPanelProps {
  disabled?: boolean;
  onPlan: (planId: PlanId) => void;
}

export function ActionPanel({ disabled = false, onPlan }: ActionPanelProps) {
  return (
    <section className="panel action-panel" aria-label="本月行动">
      <div className="section-title">
        <span>选择本月行动</span>
        <small>选择后进入事件判断</small>
      </div>
      <div className="action-grid">
        {PLANS.map((plan) => (
          <button
            className="button button--action"
            type="button"
            key={plan.id}
            disabled={disabled}
            onClick={() => onPlan(plan.id)}
          >
            <span className="action-card__name">{plan.name}</span>
            <small className="action-card__desc">{plan.description}</small>
            <div className="action-card__meta">
              <TagRow label="主加" tags={plan.primaryStats.map(getStatLabel)} tone="primary" />
              <TagRow label="副加" tags={getSecondaryTags(plan)} tone="secondary" />
              <TagRow label="风险" tags={plan.riskTags} tone="risk" />
              <TagRow label="事件" tags={plan.eventTags} tone="event" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function getStatLabel(key: StatKey): string {
  return STAT_LABELS[key];
}

function getSecondaryTags(plan: PlanConfig): string[] {
  if (plan.secondaryStats.length === 0) {
    return ['无明显副加'];
  }

  return plan.secondaryStats.map(getStatLabel);
}

function TagRow({
  label,
  tags,
  tone,
}: {
  label: string;
  tags: string[];
  tone: 'primary' | 'secondary' | 'risk' | 'event';
}) {
  return (
    <div className="action-card__row">
      <span className="action-card__label">{label}</span>
      <span className="action-card__tags">
        {tags.map((tag) => (
          <span className={`action-tag action-tag--${tone}`} key={tag}>
            {tag}
          </span>
        ))}
      </span>
    </div>
  );
}
