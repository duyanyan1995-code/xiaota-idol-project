import type { StatChange } from '../types/game';
import { formatStatDelta, getStatChangeTone } from '../utils/statDisplay';

interface StatChangeListProps {
  changes: StatChange[];
  compact?: boolean;
  limit?: number;
  className?: string;
}

export function StatChangeList({
  changes,
  compact = false,
  limit,
  className = '',
}: StatChangeListProps) {
  const visibleChanges = changes.filter((change) => change.delta !== 0);
  const limitedChanges = typeof limit === 'number' ? visibleChanges.slice(0, limit) : visibleChanges;

  if (limitedChanges.length === 0) {
    return null;
  }

  const classNames = [
    'stat-change-list',
    compact ? 'stat-change-list--compact' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} aria-label="属性变化">
      {limitedChanges.map((change) => {
        const tone = getStatChangeTone(change.key, change.delta);
        const directionClass = change.delta >= 0 ? 'stat-change-up' : 'stat-change-down';

        return (
          <span
            className={`stat-change-chip stat-change-chip--${tone} ${directionClass}`}
            key={change.key}
          >
            {formatStatDelta(change.key, change.delta)}
          </span>
        );
      })}
    </div>
  );
}
