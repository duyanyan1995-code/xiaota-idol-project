import { PLANS } from '../config/plans';
import type { PlanId } from '../types/game';

interface ActionPanelProps {
  disabled?: boolean;
  onPlan: (planId: PlanId) => void;
}

export function ActionPanel({ disabled = false, onPlan }: ActionPanelProps) {
  return (
    <section className="panel action-panel" aria-label="半年计划">
      <div className="section-title">
        <span>选择半年计划</span>
        <small>选择后进入事件阶段</small>
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
            <span>{plan.name}</span>
            <small>{plan.description}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
