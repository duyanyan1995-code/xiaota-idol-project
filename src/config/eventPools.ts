import type { EventRarity, EventTone, RandomEventConfig } from '../types/game';

export type EventPoolBucket =
  | 'none'
  | 'commonPositive'
  | 'commonNegative'
  | 'rarePositive'
  | 'rareNegative'
  | 'superRare';

export const EVENT_POOL_BASE_WEIGHTS: Record<EventPoolBucket, number> = {
  none: 40,
  commonPositive: 20,
  commonNegative: 15,
  rarePositive: 10,
  rareNegative: 8,
  superRare: 7,
};

export function getEventPoolBucket(event: Pick<RandomEventConfig, 'rarity' | 'tone'>): EventPoolBucket {
  if (event.rarity === 'superRare') {
    return 'superRare';
  }

  if (event.rarity === 'rare') {
    return event.tone === 'negative' ? 'rareNegative' : 'rarePositive';
  }

  return event.tone === 'negative' ? 'commonNegative' : 'commonPositive';
}

export function isNegativeEventBucket(bucket: EventPoolBucket): boolean {
  return bucket === 'commonNegative' || bucket === 'rareNegative';
}

export function isPositiveEventBucket(bucket: EventPoolBucket): boolean {
  return bucket === 'commonPositive' || bucket === 'rarePositive' || bucket === 'superRare';
}

export function isEventTone(value: EventTone): boolean {
  return value === 'positive' || value === 'negative' || value === 'mixed';
}

export function isEventRarity(value: EventRarity): boolean {
  return value === 'common' || value === 'rare' || value === 'superRare';
}
