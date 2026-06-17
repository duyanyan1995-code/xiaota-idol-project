import { ACTIONS } from '../config/actions';
import type { ActionId } from '../types/game';

interface ActionPanelProps {
  disabled?: boolean;
  onAction: (actionId: ActionId) => void;
}

export function ActionPanel({ disabled = false, onAction }: ActionPanelProps) {
  return (
    <section className="panel action-panel" aria-label="每日行动">
      <div className="section-title">
        <span>今日安排</span>
        <small>选择一个行动推进一天</small>
      </div>
      <div className="action-grid">
        {ACTIONS.map((action) => (
          <button
            className="button button--action"
            type="button"
            key={action.id}
            disabled={disabled}
            onClick={() => onAction(action.id)}
          >
            <span>{action.name}</span>
            <small>{action.shortName}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

