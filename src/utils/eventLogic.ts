import { CAREER_START_YEAR, MONTHS_PER_YEAR, getAnnualCalendar } from '../config/annualCalendar';
import { FALLBACK_EVENT, RANDOM_EVENTS } from '../config/events';
import { PLAN_BY_ID } from '../config/plans';
import type { GameState, PlanConfig, RandomEventConfig } from '../types/game';
import { calculateRouteScores } from './routeLogic';

export type MonthlyEventPick =
  | {
      type: 'none';
      bucket: 'none';
    }
  | {
      type: 'event';
      bucket: RandomEventConfig['type'];
      event: RandomEventConfig;
    };

const BASE_EVENT_CHANCE = 0.28;
const MAX_EVENT_CHANCE = 0.42;
const HIGH_INTENSITY_PLANS = new Set(['stageFocus', 'outsideExposure', 'fanService', 'theaterTraining']);
const RISK_TAGS = ['透支', '压力', '疲劳', '低落'];

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
  if (state.phase !== 'monthlyEvent' || hasResolvedEventThisMonth(state)) {
    return {
      type: 'none',
      bucket: 'none',
    };
  }

  const plan = getCurrentPlan(state);
  const availableEvents = RANDOM_EVENTS.filter((event) => isEventAvailable(event, state, plan));

  if (availableEvents.length === 0) {
    return {
      type: 'none',
      bucket: 'none',
    };
  }

  const riskCandidates = availableEvents.filter((event) => event.type === 'risk');
  const riskChance = getRiskEventChance(state, riskCandidates);
  if (riskCandidates.length > 0 && Math.random() < riskChance) {
    const event = pickWeightedEvent(riskCandidates, state, plan);
    if (event) {
      return {
        type: 'event',
        bucket: event.type,
        event,
      };
    }
  }

  const eventChance = getOrdinaryEventChance(state, plan);
  if (Math.random() > eventChance) {
    return {
      type: 'none',
      bucket: 'none',
    };
  }

  const ordinaryCandidates = availableEvents.filter((event) => event.type !== 'risk');
  const event = pickWeightedEvent(ordinaryCandidates, state, plan);

  return event
    ? {
        type: 'event',
        bucket: event.type,
        event,
      }
    : {
        type: 'none',
        bucket: 'none',
      };
}

export function pickRandomEvent(state: GameState): RandomEventConfig {
  const result = pickMonthlyEvent(state);
  return result.type === 'event' ? result.event : FALLBACK_EVENT;
}

function isEventAvailable(
  event: RandomEventConfig,
  state: GameState,
  plan: PlanConfig | null,
): boolean {
  if (event.stageRange) {
    const [startYear, endYear] = event.stageRange;
    if (state.currentYear < startYear || state.currentYear > endYear) {
      return false;
    }
  }

  if (event.actionTypes && (!plan || !event.actionTypes.includes(plan.id))) {
    return false;
  }

  if (event.triggerCondition && !event.triggerCondition(state)) {
    return false;
  }

  return !isEventCoolingDown(event, state);
}

function isEventCoolingDown(event: RandomEventConfig, state: GameState): boolean {
  const cooldownMonths = event.cooldownMonths ?? 0;
  if (cooldownMonths <= 0) {
    return false;
  }

  const currentAbsoluteMonth = getAbsoluteMonth(state.currentYear, state.currentMonth);
  const cooldownSource = state.eventCooldowns[event.id];
  const historySource = state.eventHistory
    .filter((entry) => entry.eventId === event.id)
    .map((entry) => getAbsoluteMonth(entry.currentYear, entry.currentMonth))
    .sort((a, b) => b - a)[0];
  const lastTriggeredMonth = cooldownSource ?? historySource;

  return lastTriggeredMonth !== undefined && currentAbsoluteMonth - lastTriggeredMonth < cooldownMonths;
}

function getRiskEventChance(state: GameState, candidates: RandomEventConfig[]): number {
  if (candidates.length === 0) {
    return 0;
  }

  let chance = 0;
  if (state.stamina <= 20) {
    chance += 0.42;
  }

  if (state.pressure >= 80) {
    chance += 0.42;
  }

  if (state.fanFatigue >= 70) {
    chance += 0.38;
  }

  if (state.mood <= 25) {
    chance += 0.34;
  }

  if (hasRecentHighElectionResult(state)) {
    chance += 0.1;
  }

  if (getRecentHighIntensityCount(state) >= 2) {
    chance += 0.16;
  }

  return clamp(chance, 0, 0.86);
}

function getOrdinaryEventChance(state: GameState, plan: PlanConfig | null): number {
  let chance = BASE_EVENT_CHANCE;

  if (plan?.id === 'restAndReflect' || plan?.id === 'stableOperation') {
    chance += 0.03;
  }

  if (isNearElection(state) || isNearB50(state)) {
    chance += 0.04;
  }

  if (state.pressure >= 65 || state.stamina <= 35 || state.fanFatigue >= 55) {
    chance += 0.04;
  }

  return clamp(chance, 0.2, MAX_EVENT_CHANCE);
}

function pickWeightedEvent(
  events: RandomEventConfig[],
  state: GameState,
  plan: PlanConfig | null,
): RandomEventConfig | null {
  if (events.length === 0) {
    return null;
  }

  const weights = events.map((event) => ({
    event,
    weight: getEventWeight(event, state, plan),
  }));
  const totalWeight = weights.reduce((total, item) => total + item.weight, 0);

  if (totalWeight <= 0) {
    return null;
  }

  let roll = Math.random() * totalWeight;
  for (const item of weights) {
    roll -= item.weight;
    if (roll <= 0) {
      return item.event;
    }
  }

  return weights[weights.length - 1].event;
}

function getEventWeight(
  event: RandomEventConfig,
  state: GameState,
  plan: PlanConfig | null,
): number {
  let weight = Math.max(0, event.baseWeight || event.weight || 1);

  if (event.priority) {
    weight += event.priority / 8;
  }

  if (event.actionTypes && plan && event.actionTypes.includes(plan.id)) {
    weight *= 1.7;
  }

  const tagMatches = countTagMatches(event.triggerTags, plan?.eventTags ?? []);
  if (tagMatches > 0) {
    weight *= 1 + Math.min(tagMatches, 3) * 0.28;
  }

  if (event.type === 'risk') {
    weight *= 1 + (state.riskWarningCounts[event.riskKey ?? event.id] ?? 0) * 0.24;
  }

  if (event.type === 'recovery' && (state.pressure >= 55 || state.stamina <= 45 || state.fanFatigue >= 45)) {
    weight *= 1.35;
  }

  if (event.type === 'negative' && getRecentHighIntensityCount(state) >= 2) {
    weight *= 1.2;
  }

  if (event.type === 'milestone') {
    weight *= 1.15;
  }

  weight *= getCareerStageWeight(event, state);
  weight *= getRouteWeight(event, state);

  return Math.max(0, weight);
}

function getCareerStageWeight(event: RandomEventConfig, state: GameState): number {
  if (state.currentYear <= 2017) {
    return hasAnyTag(event.triggerTags, ['剧场', '练习', '粉丝']) ? 1.18 : 0.92;
  }

  if (state.currentYear <= 2020) {
    return hasAnyTag(event.triggerTags, ['外务', '风格', '曝光']) ? 1.18 : 1;
  }

  if (state.currentYear <= 2023) {
    return hasAnyTag(event.triggerTags, ['应援', '舞台', '粉丝']) ? 1.16 : 1;
  }

  return hasAnyTag(event.triggerTags, ['高位', ...RISK_TAGS]) ? 1.2 : 1;
}

function getRouteWeight(event: RandomEventConfig, state: GameState): number {
  const topRoute = calculateRouteScores(state)[0];
  if (!topRoute || topRoute.score < 12) {
    return 1;
  }

  const routeTags: Record<string, string[]> = {
    stage: ['舞台', '练习', 'B50'],
    fan: ['粉丝', '应援', '营业'],
    outside: ['外务', '曝光', '路人盘'],
    style: ['风格', '形象', '物料'],
    stable: ['运营', '日常'],
    recovery: ['恢复', '休息'],
  };

  return hasAnyTag(event.triggerTags, routeTags[topRoute.id] ?? []) ? 1.14 : 1;
}

function getCurrentPlan(state: GameState): PlanConfig | null {
  const planEntry = state.planHistory.find(
    (entry) =>
      entry.currentYear === state.currentYear && entry.currentMonth === state.currentMonth,
  );

  return planEntry ? PLAN_BY_ID[planEntry.planId] ?? null : null;
}

function hasResolvedEventThisMonth(state: GameState): boolean {
  return state.eventHistory.some(
    (event) =>
      event.currentYear === state.currentYear && event.currentMonth === state.currentMonth,
  );
}

function getRecentHighIntensityCount(state: GameState): number {
  return state.planHistory.filter((entry) => {
    const monthsAgo =
      (state.currentYear - entry.currentYear) * MONTHS_PER_YEAR +
      (state.currentMonth - entry.currentMonth);
    return monthsAgo >= 0 && monthsAgo < 3 && HIGH_INTENSITY_PLANS.has(entry.planId);
  }).length;
}

function hasRecentHighElectionResult(state: GameState): boolean {
  return state.annualResults.some((result) => {
    if (result.type !== 'election' || !['kami7', 'top3', 'center'].includes(String(result.tier))) {
      return false;
    }

    return state.currentYear - result.currentYear <= 1;
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

function getAbsoluteMonth(currentYear: number, currentMonth: number): number {
  return (currentYear - CAREER_START_YEAR) * MONTHS_PER_YEAR + currentMonth;
}

function countTagMatches(sourceTags: string[], targetTags: string[]): number {
  return sourceTags.filter((tag) => targetTags.includes(tag)).length;
}

function hasAnyTag(sourceTags: string[], targetTags: string[]): boolean {
  return sourceTags.some((tag) => targetTags.includes(tag));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
