import type { StatChange, StatKey } from '../types/game';

export type StatChangeTone = 'good' | 'bad' | 'neutral';

export const STAT_LABELS: Record<StatKey, string> = {
  vocal: '唱功',
  dance: '舞蹈',
  performance: '舞台表现',
  charm: '魅力',
  popularity: '人气',
  fanLoyalty: '粉丝粘性',
  resources: '资源',
  style: '风格',
  energy: '体力',
  mood: '心情',
  stress: '压力',
  fans: '粉丝数',
};

export function getStatLabel(statKey: StatKey): string {
  return STAT_LABELS[statKey];
}

export function isPositiveStatChange(statKey: StatKey, delta: number): boolean {
  if (delta === 0) {
    return false;
  }

  if (statKey === 'stress') {
    return delta < 0;
  }

  return delta > 0;
}

export function getStatChangeTone(statKey: StatKey, delta: number): StatChangeTone {
  if (delta === 0) {
    return 'neutral';
  }

  return isPositiveStatChange(statKey, delta) ? 'good' : 'bad';
}

export function formatStatDelta(statKey: StatKey, delta: number): string {
  return `${getStatLabel(statKey)} ${formatDeltaValue(delta)}`;
}

export function formatDeltaValue(delta: number): string {
  const direction = delta > 0 ? '↑' : '↓';
  const sign = delta > 0 ? '+' : '';
  return `${direction} ${sign}${delta}`;
}

export function getStatDeltaText(change: StatChange): string {
  return formatStatDelta(change.key, change.delta);
}
