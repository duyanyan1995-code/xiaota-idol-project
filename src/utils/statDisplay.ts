import { STAT_CONFIG_BY_ID } from '../config/stats';
import type { StatChange, StatKey } from '../types/game';

export type StatChangeTone = 'good' | 'bad' | 'neutral';

export function getStatLabel(statKey: StatKey): string {
  return STAT_CONFIG_BY_ID[statKey].statName;
}

export function isPositiveStatChange(statKey: StatKey, delta: number): boolean {
  if (delta === 0) {
    return false;
  }

  if (STAT_CONFIG_BY_ID[statKey].isNegative) {
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
