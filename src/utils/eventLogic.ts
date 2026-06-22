import { getAnnualCalendar } from '../config/annualCalendar';
import {
  EVENT_POOL_BASE_WEIGHTS,
  type EventPoolBucket,
  getEventPoolBucket,
  isNegativeEventBucket,
  isPositiveEventBucket,
} from '../config/eventPools';
import { FALLBACK_EVENT, RANDOM_EVENTS } from '../config/events';
import { PLAN_BY_ID } from '../config/plans';
import type { GameState, PlanConfig, RandomEventConfig } from '../types/game';
import {
  calculateRouteScores,
  getRouteEventWeightMultiplier,
  type RouteScore,
} from './routeLogic';

const ELECTION_FOCUS_TAGS = ['粉丝', '应援', '人气', '营业'];
const B50_FOCUS_TAGS = ['舞台', 'B50', '练习'];
const PRESSURE_TAGS = ['压力', '透支'];
const RECOVERY_TAGS = ['恢复', '休息', '日常'];
const CG_COOLDOWN_MONTHS = 3;

export type MonthlyEventPick =
  | {
      type: 'none';
      bucket: 'none';
    }
  | {
      type: 'event';
      bucket: EventPoolBucket;
      event: RandomEventConfig;
    };

export function getEventById(eventId: string | null | undefined): RandomEventConfig | null {
  if (!eventId) {
    return null;
  }

  if (eventId === FALLBACK_EVENT.id) {
    return FALLBACK_EVENT;
  }

  return RANDOM_EVENTS.find((event) => event.id === eventId) ?? null;
}

export function pickMonthlyEvent(state: GameState): MonthlyEventPick {
  if (state.phase !== 'monthlyEvent') {
    return {
      type: 'none',
      bucket: 'none',
    };
  }

  const availableEvents = RANDOM_EVENTS.filter(
    (event) => !event.triggerCondition || event.triggerCondition(state),
  );

  if (availableEvents.length === 0) {
    return {
      type: 'none',
      bucket: 'none',
    };
  }

  const plan = getCurrentPlan(state);
  const routeScores = calculateRouteScores(state);
  const bucketWeights = buildBucketWeights(state, plan, availableEvents, routeScores);
  const selectedBucket = pickWeightedEntry(bucketWeights);

  if (!selectedBucket || selectedBucket === 'none') {
    return {
      type: 'none',
      bucket: 'none',
    };
  }

  const eventWeights = availableEvents
    .filter((event) => getEventPoolBucket(event) === selectedBucket)
    .map((event) => ({
      key: event.id,
      weight: getEventWeight(event, state, plan, routeScores),
      event,
    }));

  const selectedEventId = pickWeightedEntry(
    eventWeights.reduce<Record<string, number>>((result, item) => {
      result[item.key] = item.weight;
      return result;
    }, {}),
  );
  const selectedEvent = eventWeights.find((item) => item.key === selectedEventId)?.event;

  if (!selectedEvent) {
    return {
      type: 'none',
      bucket: 'none',
    };
  }

  return {
    type: 'event',
    bucket: selectedBucket,
    event: selectedEvent,
  };
}

export function pickRandomEvent(state: GameState): RandomEventConfig {
  const result = pickMonthlyEvent(state);
  return result.type === 'event' ? result.event : FALLBACK_EVENT;
}

function buildBucketWeights(
  state: GameState,
  plan: PlanConfig | null,
  events: RandomEventConfig[],
  routeScores: RouteScore[],
): Record<EventPoolBucket, number> {
  const weights = { ...EVENT_POOL_BASE_WEIGHTS };
  const availableBuckets = new Set<EventPoolBucket>(events.map(getEventPoolBucket));

  Object.keys(weights).forEach((bucket) => {
    const key = bucket as EventPoolBucket;
    if (key !== 'none' && !availableBuckets.has(key)) {
      weights[key] = 0;
    }
  });

  if (state.pressure >= 70) {
    weights.commonNegative *= 1.7;
    weights.rareNegative *= 1.9;
    weights.none *= 0.85;
  } else if (state.pressure <= 25) {
    weights.commonNegative *= 0.7;
    weights.rareNegative *= 0.6;
    weights.none *= 1.08;
  }

  if (state.stamina <= 30) {
    weights.commonNegative *= 1.55;
    weights.rareNegative *= 1.75;
    weights.none *= 0.9;
  } else if (state.stamina >= 75) {
    weights.commonNegative *= 0.82;
    weights.rareNegative *= 0.78;
  }

  if (plan?.id === 'restAndReflect') {
    weights.none *= 1.28;
    weights.commonPositive *= 1.18;
    weights.commonNegative *= 0.62;
    weights.rareNegative *= 0.56;
  }

  if (plan?.id === 'stableOperation') {
    weights.none *= 1.12;
    weights.commonPositive *= 1.12;
    weights.commonNegative *= 0.82;
    weights.rareNegative *= 0.72;
    weights.superRare *= 0.75;
  }

  const topRoute = routeScores[0];
  if (topRoute?.id === 'recovery' && topRoute.score >= 12) {
    weights.commonPositive *= 1.08;
    weights.commonNegative *= 0.88;
    weights.rareNegative *= 0.82;
  }

  if (topRoute?.id === 'stable' && topRoute.score >= 12) {
    weights.none *= 1.06;
    weights.commonPositive *= 1.06;
    weights.commonNegative *= 0.9;
    weights.rareNegative *= 0.86;
    weights.superRare *= 0.92;
  }

  if (isNearElection(state)) {
    weights.commonPositive *= 1.1;
    weights.rarePositive *= 1.22;
    weights.superRare *= 1.12;
  }

  if (isNearB50(state)) {
    weights.commonPositive *= 1.06;
    weights.rarePositive *= 1.16;
    weights.rareNegative *= 1.08;
  }

  if (hasRecentCgEvent(state)) {
    weights.superRare *= 0.34;
  }

  return clampWeights(weights);
}

function getEventWeight(
  event: RandomEventConfig,
  state: GameState,
  plan: PlanConfig | null,
  routeScores: RouteScore[],
): number {
  let weight = Math.max(0, event.baseWeight || event.weight || 1);
  const planTags = plan?.eventTags ?? [];
  const tagMatches = countTagMatches(event.triggerTags, planTags);

  if (tagMatches > 0) {
    weight *= 1 + Math.min(tagMatches, 3) * 0.45;
  }

  weight *= getRouteEventWeightMultiplier(routeScores, event.triggerTags);

  if (isNearElection(state) && hasAnyTag(event.triggerTags, ELECTION_FOCUS_TAGS)) {
    weight *= 1.65;
  }

  if (isNearB50(state) && hasAnyTag(event.triggerTags, B50_FOCUS_TAGS)) {
    weight *= 1.65;
  }

  if (state.pressure >= 70 && hasAnyTag(event.triggerTags, PRESSURE_TAGS)) {
    weight *= event.tone === 'negative' ? 1.65 : 1.25;
  }

  if (state.pressure <= 25 && event.tone === 'negative') {
    weight *= 0.72;
  }

  if (state.stamina <= 30 && hasAnyTag(event.triggerTags, ['透支', '压力'])) {
    weight *= event.tone === 'negative' ? 1.65 : 1.2;
  }

  if (state.stamina >= 75 && event.tone === 'negative') {
    weight *= 0.82;
  }

  if (plan?.id === 'restAndReflect' && hasAnyTag(event.triggerTags, RECOVERY_TAGS)) {
    weight *= isPositiveEventBucket(getEventPoolBucket(event)) ? 1.35 : 1.08;
  }

  if (plan?.id === 'restAndReflect' && event.tone === 'negative') {
    weight *= 0.62;
  }

  if (plan?.id === 'stableOperation' && isNegativeEventBucket(getEventPoolBucket(event))) {
    weight *= 0.78;
  }

  if (event.galleryId && hasRecentCgEvent(state)) {
    weight *= event.rarity === 'superRare' ? 0.28 : 0.52;
  }

  return Math.max(0, weight);
}

function getCurrentPlan(state: GameState): PlanConfig | null {
  const planEntry = state.planHistory.find(
    (entry) =>
      entry.currentYear === state.currentYear && entry.currentMonth === state.currentMonth,
  );

  return planEntry ? PLAN_BY_ID[planEntry.planId] ?? null : null;
}

function hasRecentCgEvent(state: GameState): boolean {
  return state.eventHistory.some((event) => {
    if (!event.galleryId) {
      return false;
    }

    const monthsAgo =
      (state.currentYear - event.currentYear) * 12 + (state.currentMonth - event.currentMonth);
    return monthsAgo > 0 && monthsAgo <= CG_COOLDOWN_MONTHS;
  });
}

function isNearElection(state: GameState): boolean {
  const electionMonth = getAnnualCalendar(state.currentYear).electionMonth;
  if (!electionMonth) {
    return false;
  }

  const monthsBefore = electionMonth - state.currentMonth;
  return monthsBefore >= 1 && monthsBefore <= 2;
}

function isNearB50(state: GameState): boolean {
  const b50Month = getAnnualCalendar(state.currentYear).b50Month;
  if (!b50Month) {
    return false;
  }

  const monthsBefore = b50Month - state.currentMonth;
  return monthsBefore >= 1 && monthsBefore <= 2;
}

function pickWeightedEntry<T extends string>(weights: Record<T, number>): T | null {
  const entries = Object.entries(weights).filter(([, weight]) => Number(weight) > 0) as Array<
    [T, number]
  >;
  const totalWeight = entries.reduce((total, [, weight]) => total + weight, 0);

  if (totalWeight <= 0) {
    return null;
  }

  let roll = Math.random() * totalWeight;
  for (const [key, weight] of entries) {
    roll -= weight;
    if (roll <= 0) {
      return key;
    }
  }

  return entries[entries.length - 1]?.[0] ?? null;
}

function countTagMatches(sourceTags: string[], targetTags: string[]): number {
  return sourceTags.filter((tag) => targetTags.includes(tag)).length;
}

function hasAnyTag(sourceTags: string[], targetTags: string[]): boolean {
  return sourceTags.some((tag) => targetTags.includes(tag));
}

function clampWeights<T extends string>(weights: Record<T, number>): Record<T, number> {
  return Object.entries(weights).reduce<Record<T, number>>((result, [key, value]) => {
    result[key as T] = Math.max(0, Number(value) || 0);
    return result;
  }, {} as Record<T, number>);
}
