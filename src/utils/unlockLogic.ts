import { RANDOM_EVENTS } from '../config/events';
import type { GamePhase, GameState, PlanConfig, PlanId, PlanUnlockCondition } from '../types/game';
import { calculateRouteScores, isB50AtLeast, isElectionAtLeast } from './routeLogic';

export interface PlanAvailability {
  plan: PlanConfig;
  unlocked: boolean;
  lockedReason: string | null;
}

const EVENT_CONFIG_BY_ID = RANDOM_EVENTS.reduce<
  Record<string, { tone: string; triggerTags: string[] }>
>((result, event) => {
  result[event.id] = {
    tone: event.tone,
    triggerTags: event.triggerTags,
  };
  return result;
}, {});

export function getPlanAvailability(plan: PlanConfig, state: GameState): PlanAvailability {
  const unlocked = isPlanUnlocked(plan, state);

  return {
    plan,
    unlocked,
    lockedReason: unlocked ? null : getPlanLockedReason(plan, state),
  };
}

export function isPlanUnlocked(plan: PlanConfig, state: GameState): boolean {
  if (plan.availableStages && !plan.availableStages.includes(state.phase as GamePhase)) {
    return false;
  }

  if (plan.availableMonths && !plan.availableMonths.includes(state.currentMonth)) {
    return false;
  }

  if (!plan.unlockConditions || plan.unlockConditions.length === 0) {
    return true;
  }

  const checks = plan.unlockConditions.map((condition) => isConditionMet(condition, state));
  return plan.unlockConditionMode === 'any' ? checks.some(Boolean) : checks.every(Boolean);
}

export function getPlanLockedReason(plan: PlanConfig, state: GameState): string {
  if (plan.lockedReason) {
    return plan.lockedReason;
  }

  if (plan.availableMonths && !plan.availableMonths.includes(state.currentMonth)) {
    return `仅 ${plan.availableMonths.join(' / ')} 月开放。`;
  }

  const unmetConditions = (plan.unlockConditions ?? [])
    .filter((condition) => !isConditionMet(condition, state))
    .map(describeCondition);

  if (unmetConditions.length === 0) {
    return '当前阶段暂未开放。';
  }

  return plan.unlockConditionMode === 'any'
    ? `满足其一即可：${unmetConditions.join(' / ')}`
    : unmetConditions.join('，');
}

function isConditionMet(condition: PlanUnlockCondition, state: GameState): boolean {
  switch (condition.type) {
    case 'statAtLeast':
      return state[condition.stat] >= condition.value;
    case 'statAtMost':
      return state[condition.stat] <= condition.value;
    case 'yearAtLeast':
      return state.currentYear >= condition.year;
    case 'monthIn':
      return condition.months.includes(state.currentMonth);
    case 'planCountAtLeast':
      return countPlan(state, condition.planId, Boolean(condition.withinYear)) >= condition.count;
    case 'eventSeen':
      return state.eventHistory.some((event) => event.eventId === condition.eventId);
    case 'eventTagSeen':
      return state.eventHistory.some((entry) => {
        const event = EVENT_CONFIG_BY_ID[entry.eventId];
        if (!event || (condition.tone && event.tone !== condition.tone)) {
          return false;
        }

        return event.triggerTags.includes(condition.tag);
      });
    case 'electionTierAtLeast':
      return state.electionResults.some((result) => isElectionAtLeast(result.tier, condition.tier));
    case 'b50TierAtLeast':
      return state.b50Results.some((result) => isB50AtLeast(result.tier, condition.tier));
    case 'routeScoreAtLeast':
      return (
        calculateRouteScores(state).find((route) => route.id === condition.route)?.score ?? 0
      ) >= condition.value;
    default:
      return false;
  }
}

function countPlan(state: GameState, planId: PlanId, withinYear: boolean): number {
  return state.planHistory.filter((entry) => {
    if (entry.planId !== planId) {
      return false;
    }

    return withinYear ? entry.currentYear === state.currentYear : true;
  }).length;
}

function describeCondition(condition: PlanUnlockCondition): string {
  switch (condition.type) {
    case 'statAtLeast':
      return `${getStatLabel(condition.stat)} ≥ ${condition.value}`;
    case 'statAtMost':
      return `${getStatLabel(condition.stat)} ≤ ${condition.value}`;
    case 'yearAtLeast':
      return `${condition.year} 年后开放`;
    case 'monthIn':
      return `仅 ${condition.months.join(' / ')} 月开放`;
    case 'planCountAtLeast':
      return `${getPlanLabel(condition.planId)}累计 ≥ ${condition.count} 次`;
    case 'eventSeen':
      return `经历事件 ${condition.eventId}`;
    case 'eventTagSeen':
      return `经历${condition.tone === 'positive' ? '正向' : ''}${condition.tag}事件`;
    case 'electionTierAtLeast':
      return `总选达到 ${condition.tier}`;
    case 'b50TierAtLeast':
      return `B50 达到 ${condition.tier}`;
    case 'routeScoreAtLeast':
      return `路线分数达到 ${condition.value}`;
    default:
      return '条件未满足';
  }
}

function getStatLabel(stat: string): string {
  const labels: Record<string, string> = {
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

  return labels[stat] ?? stat;
}

function getPlanLabel(planId: PlanId): string {
  const labels: Record<PlanId, string> = {
    theaterTraining: '剧场训练',
    fanService: '粉丝营业',
    outsideExposure: '外务曝光',
    stageFocus: '舞台专项',
    imageBuilding: '形象经营',
    restAndReflect: '休整沉淀',
    stableOperation: '稳定运营',
    specialSoloWork: '个人外务',
    specialIntensiveTraining: '高强度集训',
    specialBirthdaySupport: '生日应援筹备',
    specialStyleShift: '风格转型',
  };

  return labels[planId];
}
