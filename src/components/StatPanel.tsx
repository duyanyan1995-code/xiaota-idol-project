import type { GameState } from '../types/game';

interface StatPanelProps {
  state: GameState;
}

const primaryStats = [
  { key: 'energy', label: '体力' },
  { key: 'mood', label: '心情' },
  { key: 'vocal', label: '唱功' },
  { key: 'dance', label: '舞蹈' },
  { key: 'charm', label: '魅力' },
  { key: 'popularity', label: '人气' },
] as const;

export function StatPanel({ state }: StatPanelProps) {
  return (
    <section className="panel stat-panel" aria-label="属性面板">
      <div className="section-title">
        <span>当前属性</span>
        <strong>Day {state.day}</strong>
      </div>
      <div className="stat-list">
        {primaryStats.map((stat) => (
          <div className="stat-row" key={stat.key}>
            <div className="stat-row__head">
              <span>{stat.label}</span>
              <strong>{state[stat.key]}</strong>
            </div>
            <div className="stat-row__bar" aria-hidden="true">
              <span style={{ width: `${state[stat.key]}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="resource-grid">
        <div>
          <span>粉丝数</span>
          <strong>{state.fans}</strong>
        </div>
        <div>
          <span>金币</span>
          <strong>{state.coins}</strong>
        </div>
      </div>
    </section>
  );
}

