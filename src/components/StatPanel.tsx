import { useState } from 'react';
import { DETAIL_STAT_GROUPS, MAIN_STAT_KEYS, STAT_CONFIG_BY_ID } from '../config/stats';
import type { GameState, StatChange, StatKey } from '../types/game';
import { getRouteSummaryLabel } from '../utils/routeLogic';
import { formatDeltaValue, getStatChangeTone } from '../utils/statDisplay';

interface StatPanelProps {
  state: GameState;
  recentChanges?: StatChange[] | null;
}

export function StatPanel({ state, recentChanges = null }: StatPanelProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <section className="quick-status" aria-label="关键状态">
        {MAIN_STAT_KEYS.map((statKey) => (
          <QuickStatusItem
            changes={recentChanges}
            key={statKey}
            label={STAT_CONFIG_BY_ID[statKey].statName}
            statKey={statKey}
            value={state[statKey]}
          />
        ))}
        <button className="status-route" type="button" onClick={() => setShowDetails(true)}>
          <span>倾向</span>
          <strong>{getRouteSummaryLabel(state)}</strong>
        </button>
      </section>

      {showDetails ? (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-card status-detail" role="dialog" aria-modal="true">
            <p className="eyebrow">状态详情</p>
            <h2>小獭当前状态</h2>
            {DETAIL_STAT_GROUPS.map((group) => (
              <div className="status-detail-group" key={group.title}>
                <h3>{group.title}</h3>
                <div className="status-detail-grid">
                  {group.stats.map((statKey) => (
                    <DetailItem
                      key={statKey}
                      label={STAT_CONFIG_BY_ID[statKey].statName}
                      value={state[statKey]}
                    />
                  ))}
                </div>
              </div>
            ))}
            <p className="status-detail-note">作品完成度：{state.workGrade}（仅为后续关键事件预留）</p>
            <button className="button button--primary" type="button" onClick={() => setShowDetails(false)}>
              关闭
            </button>
          </section>
        </div>
      ) : null}
    </>
  );
}

function QuickStatusItem({
  label,
  value,
  statKey,
  changes,
}: {
  label: string;
  value: number;
  statKey: StatKey;
  changes: StatChange[] | null;
}) {
  const change = changes?.find((item) => item.key === statKey && item.delta !== 0);
  const tone = change ? getStatChangeTone(change.key, change.delta) : null;

  return (
    <div className="quick-status__card">
      <span>{label}</span>
      <strong>{value}</strong>
      {change && tone ? (
        <em className={`quick-status__delta quick-status__delta--${tone} stat-pulse`}>
          {formatDeltaValue(change.delta)}
        </em>
      ) : null}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
