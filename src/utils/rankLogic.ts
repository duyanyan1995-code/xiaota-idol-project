import { RANDOM_EVENTS } from '../config/events';
import {
  B50_TIER_LABELS,
  B50_TIER_NARRATIVES,
  B50_TIER_REWARDS,
  ELECTION_TIER_LABELS,
  ELECTION_TIER_NARRATIVES,
  ELECTION_TIER_REWARDS,
} from '../config/annualResults';
import {
  getRankCalibrationStage,
  type B50Thresholds,
  type ElectionThresholds,
  type HighTierRequirement,
  type RankCalibrationStage,
} from '../config/rankCalibration';
import type {
  B50Result,
  B50Tier,
  ElectionResult,
  ElectionTier,
  EventTone,
  GameState,
  NodeGrade,
  NodeTier,
  PlanId,
  ScoreModifier,
  StatDeltas,
} from '../types/game';

const EVENT_CONFIG_BY_ID = RANDOM_EVENTS.reduce<
  Record<string, { tone: EventTone; triggerTags: string[] }>
>((result, event) => {
  result[event.id] = {
    tone: event.tone,
    triggerTags: event.triggerTags,
  };
  return result;
}, {});

const ELECTION_TIER_ORDER: ElectionTier[] = ['outside', 'ranked', 'top48', 'top32', 'top16', 'kami7', 'top3', 'center'];
const B50_TIER_ORDER: B50Tier[] = ['notRanked', 'ranked', 'middle', 'high', 'highlight', 'legend'];

export function calculateElectionResult(state: GameState): ElectionResult {
  const calibration = getRankCalibrationStage(state.currentYear);
  const planStats = getYearPlanStats(state);
  const eventStats = getYearEventStats(state);
  const fansScore = normalizeFans(state.fanCount, 6200);
  const actionEventScore = clamp(
    planStats.fanService * 11 +
      planStats.specialBirthdaySupport * 10 +
      planStats.specialSoloWork * 9 +
      planStats.outsideExposure * 7 +
      planStats.imageBuilding * 6 +
      planStats.specialStyleShift * 6 +
      planStats.stableOperation * 3 +
      planStats.theaterTraining * 1.5 +
      planStats.stageFocus * 1.5 +
      eventStats.fanPositive * 9 +
      eventStats.exposurePositive * 8 -
      eventStats.negative * 7,
    0,
    100,
  );
  const eventBonus = getEventBonus(state, 'electionBonus');
  const statusModifiers = getStateModifiers(state, 'election');
  const fatiguePenalty = Math.max(0, state.fanFatigue - state.operation * 0.35) * 0.16;
  const pressurePenalty = Math.max(0, state.pressure - state.operation * 0.25) * 0.08;
  const rawScore =
    fansScore * 0.35 +
    clamp(state.supportPower, 0, 100) * 0.25 +
    clamp(state.influence, 0, 100) * 0.18 +
    clamp(state.resource, 0, 100) * 0.08 +
    clamp(state.charm, 0, 100) * 0.08 +
    clamp(state.stagePower, 0, 100) * 0.04 +
    actionEventScore * 0.09 +
    eventBonus +
    sumModifiers(statusModifiers) -
    fatiguePenalty -
    pressurePenalty;
  const score = clamp(
    Math.round(rawScore * calibration.electionScoreMultiplier),
    0,
    calibration.electionScoreCap,
  );
  const tierResolution = resolveElectionTier(score, state, planStats, eventStats, calibration);
  const tier = tierResolution.tier;
  const expectedTier = getExpectedElectionTier(state, score, calibration.electionThresholds);
  const grade = electionTierToGrade(tier);
  const mainFactors = buildElectionMainFactors(state, planStats, fansScore);
  const bonusFactors = buildElectionBonusFactors(planStats, eventStats, eventBonus);
  const penaltyFactors = [
    ...buildElectionPenaltyFactors(state, fansScore, eventStats),
    ...tierResolution.notes,
  ];
  const expectation = getElectionExpectationAdjustment(tier, expectedTier);
  const message = ELECTION_TIER_NARRATIVES[tier];

  return {
    id: `election-${state.year}`,
    year: state.year,
    currentYear: state.currentYear,
    currentMonth: state.currentMonth,
    score,
    grade,
    gradeText: ELECTION_TIER_LABELS[tier],
    tier,
    rankLabel: ELECTION_TIER_LABELS[tier],
    expectedTier,
    eventBonus,
    modifiers: statusModifiers,
    mainFactors,
    bonusFactors: expectation.bonusNote ? [...bonusFactors, expectation.bonusNote] : bonusFactors,
    penaltyFactors: expectation.penaltyNote ? [...penaltyFactors, expectation.penaltyNote] : penaltyFactors,
    rewards: mergeDeltas(ELECTION_TIER_REWARDS[tier], expectation.deltas),
    message,
  };
}

export function calculateB50Result(state: GameState): B50Result {
  const calibration = getRankCalibrationStage(state.currentYear);
  const planStats = getYearPlanStats(state);
  const recentPlanStats = getRecentPlanStats(state, 2);
  const eventStats = getYearEventStats(state);
  const fansScore = normalizeFans(state.fanCount, 5200);
  const actionScore = clamp(
    planStats.stageFocus * 12 +
      planStats.specialIntensiveTraining * 11 +
      planStats.theaterTraining * 8 +
      planStats.fanService * 4 +
      planStats.specialBirthdaySupport * 4 +
      planStats.stableOperation * 3 +
      planStats.imageBuilding * 2 +
      planStats.specialStyleShift * 2 +
      planStats.outsideExposure * 1.5 +
      planStats.specialSoloWork * 1.5 +
      recentPlanStats.stageFocus * 8 +
      recentPlanStats.specialIntensiveTraining * 8 +
      recentPlanStats.theaterTraining * 5,
    0,
    100,
  );
  const eventStateScore = clamp(
    50 +
      eventStats.stagePositive * 10 -
      eventStats.stageNegative * 10 -
      (state.stamina < 30 ? 12 : 0) -
      (state.pressure >= 70 ? 10 : 0) +
      (state.mood >= 80 ? 6 : 0),
    0,
    100,
  );
  const eventBonus = getEventBonus(state, 'b50Bonus');
  const statusModifiers = getStateModifiers(state, 'b50');
  const fatiguePenalty = Math.max(0, state.fanFatigue - state.operation * 0.25) * 0.1;
  const pressurePenalty = Math.max(0, state.pressure - 50) * 0.08;
  const rawScore =
    clamp(state.stagePower, 0, 100) * 0.3 +
    clamp(state.vocal, 0, 100) * 0.13 +
    clamp(state.dance, 0, 100) * 0.13 +
    clamp(state.supportPower, 0, 100) * 0.2 +
    fansScore * 0.11 +
    clamp(state.influence, 0, 100) * 0.05 +
    actionScore * 0.1 +
    eventStateScore * 0.05 +
    eventBonus +
    sumModifiers(statusModifiers) -
    fatiguePenalty -
    pressurePenalty;
  const score = clamp(
    Math.round(rawScore * calibration.b50ScoreMultiplier),
    0,
    calibration.b50ScoreCap,
  );
  const tierResolution = resolveB50Tier(score, state, planStats, eventStats, calibration);
  const tier = tierResolution.tier;
  const grade = b50TierToGrade(tier);
  const mainFactors = buildB50MainFactors(state, planStats);
  const bonusFactors = buildB50BonusFactors(planStats, recentPlanStats, eventStats, eventBonus);
  const penaltyFactors = [
    ...buildB50PenaltyFactors(state, eventStats),
    ...tierResolution.notes,
  ];
  const message = B50_TIER_NARRATIVES[tier];

  return {
    id: `b50-${state.year}`,
    year: state.year,
    currentYear: state.currentYear,
    currentMonth: state.currentMonth,
    score,
    grade,
    gradeText: B50_TIER_LABELS[tier],
    tier,
    rankLabel: B50_TIER_LABELS[tier],
    eventBonus,
    modifiers: statusModifiers,
    mainFactors,
    bonusFactors,
    penaltyFactors,
    rewards: B50_TIER_REWARDS[tier],
    message,
  };
}

export function getCareerProgressFactor(currentYear: number): number {
  return getRankCalibrationStage(currentYear).electionScoreMultiplier;
}

export function mapElectionScoreToTier(
  score: number,
  thresholds: ElectionThresholds = getRankCalibrationStage(2025).electionThresholds,
): ElectionTier {
  if (score >= thresholds.center) {
    return 'center';
  }

  if (score >= thresholds.top3) {
    return 'top3';
  }

  if (score >= thresholds.kami7) {
    return 'kami7';
  }

  if (score >= thresholds.top16) {
    return 'top16';
  }

  if (score >= thresholds.top32) {
    return 'top32';
  }

  if (score >= thresholds.top48) {
    return 'top48';
  }

  if (score >= thresholds.ranked) {
    return 'ranked';
  }

  return 'outside';
}

export function mapB50ScoreToTier(
  score: number,
  thresholds: B50Thresholds = getRankCalibrationStage(2025).b50Thresholds,
): B50Tier {
  if (score >= thresholds.legend) {
    return 'legend';
  }

  if (score >= thresholds.highlight) {
    return 'highlight';
  }

  if (score >= thresholds.high) {
    return 'high';
  }

  if (score >= thresholds.middle) {
    return 'middle';
  }

  if (score >= thresholds.ranked) {
    return 'ranked';
  }

  return 'notRanked';
}

function resolveElectionTier(
  score: number,
  state: GameState,
  planStats: Record<PlanId, number>,
  eventStats: ReturnType<typeof getYearEventStats>,
  calibration: RankCalibrationStage,
): { tier: ElectionTier; notes: string[] } {
  const notes: string[] = [];
  let tier = mapElectionScoreToTier(score, calibration.electionThresholds);
  const cappedTier = capTier(tier, calibration.maxElectionTier, ELECTION_TIER_ORDER);

  if (cappedTier !== tier) {
    notes.push(`${calibration.name}最高参考档位为 ${ELECTION_TIER_LABELS[calibration.maxElectionTier]}`);
    tier = cappedTier;
  }

  if (tier === 'center' && calibration.centerRequires) {
    if (!meetsHighTierRequirement(state, planStats, eventStats.positive, eventStats.negative, calibration.centerRequires)) {
      notes.push('第1条件未满足，降为 Top3');
      tier = 'top3';
    }
  }

  if (tier === 'top3' && calibration.kami7Requires) {
    if (!meetsHighTierRequirement(state, planStats, eventStats.positive, eventStats.negative, calibration.kami7Requires)) {
      notes.push('Top3 条件未满足，降为神七');
      tier = 'kami7';
    }
  }

  if (tier === 'kami7' && calibration.kami7Requires) {
    if (!meetsHighTierRequirement(state, planStats, eventStats.positive, eventStats.negative, calibration.kami7Requires)) {
      notes.push('神七条件未满足，降为 TOP16');
      tier = 'top16';
    }
  }

  return { tier, notes };
}

function resolveB50Tier(
  score: number,
  state: GameState,
  planStats: Record<PlanId, number>,
  eventStats: ReturnType<typeof getYearEventStats>,
  calibration: RankCalibrationStage,
): { tier: B50Tier; notes: string[] } {
  const notes: string[] = [];
  let tier = mapB50ScoreToTier(score, calibration.b50Thresholds);
  const cappedTier = capTier(tier, calibration.maxB50Tier, B50_TIER_ORDER);

  if (cappedTier !== tier) {
    notes.push(`${calibration.name}最高参考档位为 ${B50_TIER_LABELS[calibration.maxB50Tier]}`);
    tier = cappedTier;
  }

  if (tier === 'legend' && calibration.legendRequires) {
    if (!meetsHighTierRequirement(state, planStats, eventStats.stagePositive, eventStats.stageNegative, calibration.legendRequires)) {
      notes.push('年度舞台记忆条件未满足，降为名场面');
      tier = 'highlight';
    }
  }

  if (tier === 'highlight' && calibration.highlightRequires) {
    if (!meetsHighTierRequirement(state, planStats, eventStats.stagePositive, eventStats.stageNegative, calibration.highlightRequires)) {
      notes.push('名场面条件未满足，降为高位曲');
      tier = 'high';
    }
  }

  return { tier, notes };
}

function capTier<T extends string>(tier: T, maxTier: T, order: T[]): T {
  return order.indexOf(tier) > order.indexOf(maxTier) ? maxTier : tier;
}

function meetsHighTierRequirement(
  state: GameState,
  planStats: Record<PlanId, number>,
  positiveEvents: number,
  negativeEvents: number,
  requirement: HighTierRequirement,
): boolean {
  const planCountsOk = Object.entries(requirement.minPlanCounts ?? {}).every(([planId, count]) => {
    return planStats[planId as PlanId] >= (count ?? 0);
  });

  return (
    state.fanCount >= requirement.minFans &&
    state.supportPower >= requirement.minFanLoyalty &&
    (requirement.minPopularity === undefined || state.influence >= requirement.minPopularity) &&
    (requirement.minPerformance === undefined || state.stagePower >= requirement.minPerformance) &&
    positiveEvents >= requirement.minPositiveEvents &&
    negativeEvents <= requirement.maxNegativeEvents &&
    planCountsOk &&
    state.pressure < 85
  );
}

function getYearPlanStats(state: GameState): Record<PlanId, number> {
  return countPlans(
    state,
    state.planHistory.filter(
      (entry) =>
        entry.currentYear === state.currentYear && entry.currentMonth <= state.currentMonth,
    ),
  );
}

function getRecentPlanStats(state: GameState, months: number): Record<PlanId, number> {
  return countPlans(
    state,
    state.planHistory.filter((entry) => {
      const monthDistance =
        (state.currentYear - entry.currentYear) * 12 + (state.currentMonth - entry.currentMonth);
      return monthDistance >= 0 && monthDistance < months;
    }),
  );
}

function countPlans(state: GameState, entries: GameState['planHistory']): Record<PlanId, number> {
  const result: Record<PlanId, number> = {
    theaterTraining: 0,
    fanService: 0,
    outsideExposure: 0,
    stageFocus: 0,
    imageBuilding: 0,
    restAndReflect: 0,
    stableOperation: 0,
    specialSoloWork: 0,
    specialIntensiveTraining: 0,
    specialBirthdaySupport: 0,
    specialStyleShift: 0,
  };

  entries.forEach((entry) => {
    result[entry.planId] = (result[entry.planId] ?? 0) + 1;
  });

  return result;
}

function getYearEventStats(state: GameState) {
  return state.eventHistory
    .filter((entry) => entry.currentYear === state.currentYear && entry.currentMonth <= state.currentMonth)
    .reduce(
      (result, entry) => {
        const config = EVENT_CONFIG_BY_ID[entry.eventId];
        const tags = config?.triggerTags ?? [];
        const tone = config?.tone ?? 'mixed';

        if (tone === 'negative') {
          result.negative += 1;
        }

        if (tone === 'positive') {
          result.positive += 1;
        }

        if (tone === 'positive' && hasAnyTag(tags, ['粉丝', '应援', '营业'])) {
          result.fanPositive += 1;
        }

        if (tone === 'positive' && hasAnyTag(tags, ['外务', '曝光', '舆论'])) {
          result.exposurePositive += 1;
        }

        if (tone !== 'negative' && hasAnyTag(tags, ['舞台', 'B50', '练习'])) {
          result.stagePositive += 1;
        }

        if (tone === 'negative' && hasAnyTag(tags, ['舞台', 'B50', '练习', '透支'])) {
          result.stageNegative += 1;
        }

        return result;
      },
      {
        fanPositive: 0,
        exposurePositive: 0,
        positive: 0,
        negative: 0,
        stagePositive: 0,
        stageNegative: 0,
      },
    );
}

function getStateModifiers(state: GameState, node: 'election' | 'b50'): ScoreModifier[] {
  const modifiers: Array<ScoreModifier | null> = [
    state.pressure >= 85 ? { label: '压力接近透支', value: node === 'election' ? -10 : -12 } : null,
    state.pressure >= 70 && state.pressure < 85 ? { label: '压力偏高', value: node === 'election' ? -6 : -7 } : null,
    state.mood < 30 ? { label: '心情低落', value: -8 } : null,
    state.mood >= 80 ? { label: '心情稳定', value: 4 } : null,
    state.stamina < 30 ? { label: '体力偏低', value: node === 'election' ? -4 : -7 } : null,
    state.stamina >= 75 ? { label: '状态充足', value: node === 'election' ? 2 : 3 } : null,
  ];

  return modifiers.filter(Boolean) as ScoreModifier[];
}

function buildElectionMainFactors(
  state: GameState,
  planStats: Record<PlanId, number>,
  fansScore: number,
): string[] {
  return compactFactors([
    fansScore >= 68 ? '粉丝数积累较强' : null,
    state.supportPower >= 65 ? '核心应援力稳定' : null,
    state.influence >= 60 ? '影响力稳步提升' : null,
    state.charm >= 65 ? '形象魅力有记忆点' : null,
    planStats.fanService + planStats.specialBirthdaySupport >= 3 ? '粉丝营业和应援筹备充足' : null,
  ]);
}

function buildElectionBonusFactors(
  planStats: Record<PlanId, number>,
  eventStats: ReturnType<typeof getYearEventStats>,
  eventBonus: number,
): string[] {
  return compactFactors([
    planStats.outsideExposure + planStats.specialSoloWork >= 2 ? '外务曝光带来路人认知' : null,
    planStats.imageBuilding + planStats.specialStyleShift >= 2 ? '形象经营强化辨识度' : null,
    planStats.stableOperation >= 2 ? '稳定运营保持基本盘' : null,
    eventStats.fanPositive > 0 ? '正向粉丝事件带来加成' : null,
    eventStats.exposurePositive > 0 ? '曝光事件扩大讨论度' : null,
    eventBonus > 0 ? `事件加成 +${eventBonus}` : null,
  ]);
}

function buildElectionPenaltyFactors(
  state: GameState,
  fansScore: number,
  eventStats: ReturnType<typeof getYearEventStats>,
): string[] {
  return compactFactors([
    fansScore < 36 ? '粉丝数仍然不足' : null,
    state.supportPower < 45 ? '核心应援力还不稳定' : null,
    state.influence < 40 ? '外部认知偏弱' : null,
    state.pressure >= 70 ? '压力偏高影响发挥' : null,
    state.mood < 40 ? '心情低落影响营业状态' : null,
    eventStats.negative > 0 ? '负面事件消耗支持度' : null,
  ]);
}

function buildB50MainFactors(state: GameState, planStats: Record<PlanId, number>): string[] {
  return compactFactors([
    state.stagePower >= 70 ? '舞台力突出' : null,
    state.supportPower >= 65 ? '核心应援力稳定' : null,
    state.dance >= 65 ? '舞蹈基础扎实' : null,
    state.vocal >= 65 ? '唱功稳定' : null,
    planStats.stageFocus + planStats.specialIntensiveTraining >= 3 ? '舞台专项和集训次数较多' : null,
  ]);
}

function buildB50BonusFactors(
  planStats: Record<PlanId, number>,
  recentPlanStats: Record<PlanId, number>,
  eventStats: ReturnType<typeof getYearEventStats>,
  eventBonus: number,
): string[] {
  return compactFactors([
    planStats.theaterTraining + planStats.specialIntensiveTraining >= 3 ? '剧场训练和集训持续打底' : null,
    planStats.fanService + planStats.specialBirthdaySupport >= 2 ? '粉丝愿意为舞台投票' : null,
    recentPlanStats.stageFocus + recentPlanStats.specialIntensiveTraining > 0 ? 'B50 前集中打磨舞台' : null,
    eventStats.stagePositive > 0 ? '舞台相关事件形成记忆点' : null,
    eventBonus > 0 ? `事件加成 +${eventBonus}` : null,
  ]);
}

function buildB50PenaltyFactors(
  state: GameState,
  eventStats: ReturnType<typeof getYearEventStats>,
): string[] {
  return compactFactors([
    state.stagePower < 45 ? '舞台力积累不足' : null,
    state.supportPower < 45 ? '粉丝投票基础偏弱' : null,
    state.stamina < 35 ? '体力偏低影响舞台发挥' : null,
    state.pressure >= 70 ? '压力偏高影响稳定度' : null,
    eventStats.stageNegative > 0 ? '负面舞台事件影响记忆点' : null,
  ]);
}

function getEventBonus(
  state: GameState,
  key: 'b50Bonus' | 'electionBonus',
): number {
  return state.eventHistory
    .filter((event) => event.currentYear === state.currentYear && event.currentMonth <= state.currentMonth)
    .reduce((total, event) => total + event[key], 0);
}

function normalizeFans(fanCount: number, target: number): number {
  return clamp(Math.sqrt(Math.max(0, fanCount)) / Math.sqrt(target) * 100, 0, 100);
}

function electionTierToGrade(tier: ElectionTier): NodeGrade {
  const gradeMap: Record<ElectionTier, NodeGrade> = {
    outside: 'E',
    ranked: 'D',
    top48: 'D',
    top32: 'C',
    top16: 'B',
    kami7: 'A',
    top3: 'A',
    center: 'S',
  };

  return gradeMap[tier];
}

function getExpectedElectionTier(
  state: GameState,
  score: number,
  thresholds: ElectionThresholds,
): ElectionTier {
  const previousResult = [...state.electionResults]
    .filter((result) => result.currentYear < state.currentYear)
    .sort((a, b) => b.currentYear - a.currentYear)[0];
  const baselineScore = clamp(
    score +
      (state.fanCount >= 2800 ? 4 : 0) +
      (state.supportPower >= 60 ? 4 : 0) +
      (state.influence >= 55 ? 3 : 0),
    0,
    100,
  );
  const statExpectation = mapElectionScoreToTier(baselineScore, thresholds);

  if (!previousResult?.tier) {
    return statExpectation;
  }

  return higherElectionTier(statExpectation, previousResult.tier as ElectionTier);
}

function getElectionExpectationAdjustment(
  actualTier: ElectionTier,
  expectedTier: ElectionTier,
): {
  deltas: StatDeltas;
  bonusNote?: string;
  penaltyNote?: string;
} {
  const gap = getTierIndex(expectedTier, ELECTION_TIER_ORDER) - getTierIndex(actualTier, ELECTION_TIER_ORDER);

  if (gap >= 2) {
    return {
      deltas: { pressure: 5, supportPower: -1, fanFatigue: 4 },
      penaltyNote: '结果低于预期，压力和粉丝疲劳上升',
    };
  }

  if (gap <= 0 && actualTier !== 'outside') {
    return {
      deltas: { mood: 3, supportPower: 1 },
      bonusNote: '达到或超过预期，应援信心提升',
    };
  }

  return { deltas: {} };
}

function higherElectionTier(a: ElectionTier, b: ElectionTier): ElectionTier {
  return getTierIndex(a, ELECTION_TIER_ORDER) >= getTierIndex(b, ELECTION_TIER_ORDER) ? a : b;
}

function getTierIndex<T extends NodeTier>(tier: T, order: T[]): number {
  const index = order.indexOf(tier);
  return index >= 0 ? index : 0;
}

function mergeDeltas(...sources: StatDeltas[]): StatDeltas {
  return sources.reduce<StatDeltas>((result, source) => {
    Object.entries(source).forEach(([key, value]) => {
      if (value === undefined) {
        return;
      }

      const statKey = key as keyof StatDeltas;
      result[statKey] = (result[statKey] ?? 0) + value;
    });

    return result;
  }, {});
}

function b50TierToGrade(tier: B50Tier): NodeGrade {
  const gradeMap: Record<B50Tier, NodeGrade> = {
    notRanked: 'E',
    ranked: 'D',
    middle: 'C',
    high: 'B',
    highlight: 'A',
    legend: 'S',
  };

  return gradeMap[tier];
}

function compactFactors(factors: Array<string | null>): string[] {
  return factors.filter(Boolean).slice(0, 4) as string[];
}

function hasAnyTag(sourceTags: string[], targetTags: string[]): boolean {
  return sourceTags.some((tag) => targetTags.includes(tag));
}

function sumModifiers(modifiers: ScoreModifier[]): number {
  return modifiers.reduce((total, modifier) => total + modifier.value, 0);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
