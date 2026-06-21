import { useState } from 'react';
import type { GameState, GrowthStat, StatChange, StatKey } from '../types/game';
import { getRouteSummaryLabel } from '../utils/routeLogic';
import { formatDeltaValue, getStatChangeTone } from '../utils/statDisplay';

interface StatPanelProps {
  state: GameState;
  recentChanges?: StatChange[] | null;
}

const growthStats: { key: GrowthStat; label: string }[] = [
  { key: 'vocal', label: '唱功' },
  { key: 'dance', label: '舞蹈' },
  { key: 'performance', label: '舞台表现' },
  { key: 'charm', label: '魅力' },
  { key: 'popularity', label: '人气' },
  { key: 'fanLoyalty', label: '粉丝黏性' },
  { key: 'resources', label: '资源' },
  { key: 'style', label: '风格' },
];

export function StatPanel({ state, recentChanges = null }: StatPanelProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <section className="quick-status" aria-label="关键状态">
        <QuickStatusItem label="体力" value={state.energy} statKey="energy" changes={recentChanges} />
        <QuickStatusItem label="心情" value={state.mood} statKey="mood" changes={recentChanges} />
        <QuickStatusItem label="压力" value={state.stress} statKey="stress" changes={recentChanges} />
        <QuickStatusItem label="粉丝" value={state.fans} statKey="fans" changes={recentChanges} />
        <QuickStatusItem label="人气" value={state.popularity} statKey="popularity" changes={recentChanges} />
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
            <div className="status-detail-grid">
              <DetailItem label="体力" value={state.energy} />
              <DetailItem label="心情" value={state.mood} />
              <DetailItem label="压力" value={state.stress} />
              <DetailItem label="粉丝数" value={state.fans} />
              {growthStats.map((stat) => (
                <DetailItem key={stat.key} label={stat.label} value={state[stat.key]} />
              ))}
            </div>
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
