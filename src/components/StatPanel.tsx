import { useState } from 'react';
import type { GameState, GrowthStat } from '../types/game';

interface StatPanelProps {
  state: GameState;
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

export function StatPanel({ state }: StatPanelProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <section className="quick-status" aria-label="关键状态">
        <div>
          <span>体力</span>
          <strong>{state.energy}</strong>
        </div>
        <div>
          <span>心情</span>
          <strong>{state.mood}</strong>
        </div>
        <div>
          <span>压力</span>
          <strong>{state.stress}</strong>
        </div>
        <div>
          <span>粉丝</span>
          <strong>{state.fans}</strong>
        </div>
        <div>
          <span>人气</span>
          <strong>{state.popularity}</strong>
        </div>
        <button className="status-route" type="button" onClick={() => setShowDetails(true)}>
          <span>路线</span>
          <strong>{getRouteLabel(state)}</strong>
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

function DetailItem({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getRouteLabel(state: GameState): string {
  if (state.stress >= 70) {
    return '注意状态';
  }

  const routes = [
    { value: state.performance, label: '舞台' },
    { value: state.fanLoyalty, label: '陪伴' },
    { value: state.popularity, label: '人气' },
    { value: state.style, label: '风格' },
  ];

  return routes.sort((a, b) => b.value - a.value)[0].label;
}
