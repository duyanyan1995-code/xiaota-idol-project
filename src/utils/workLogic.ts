import {
  THEME_NODES,
  WORK_GRADE_LABELS,
  WORK_GRADE_NARRATIVES,
  WORK_GRADE_THRESHOLDS,
  WORK_REWARDS_BY_GRADE,
  type ThemeNodeConfig,
} from '../config/works';
import type {
  AnnualResult,
  EventHistoryEntry,
  GameState,
  PlanId,
  StatDeltas,
  StatKey,
  ThemeNodeResult,
  WorkGrade,
  WorkMilestone,
  WorkResult,
} from '../types/game';
import { isB50AtLeast, isElectionAtLeast } from './routeLogic';

export function getThemeNodeConfigForState(state: GameState): ThemeNodeConfig | null {
  const config = THEME_NODES.find(
    (node) =>
      node.year === state.currentYear &&
      node.month === state.currentMonth &&
      node.phaseEnabled !== 'phase8',
  );

  if (!config) {
    return null;
  }

  if (config.nodeType === 'performanceWork' && config.gradeEnabled) {
    return config.workId && !hasWorkResult(state, config.workId) ? config : null;
  }

  return !hasThemeNodeResult(state, config.id) ? config : null;
}

export function buildThemeNodeResult(state: GameState, config: ThemeNodeConfig): ThemeNodeResult {
  return {
    id: `theme-${config.id}-${config.year}`,
    year: state.year,
    currentYear: config.year,
    month: config.month,
    nodeId: config.id,
    title: config.title,
    nodeType: 'timeline',
    narrative: config.description,
    deltas: config.timelineDeltas ?? {},
    sourceName: config.sourceName,
    createdAtMonth: config.month,
    potentialVisualKey: config.potentialVisualKey,
  };
}

export function buildWorkResult(state: GameState, config: ThemeNodeConfig): WorkResult {
  if (!config.workId) {
    throw new Error(`Missing workId for performance work node: ${config.id}`);
  }

  const relatedActionSummary = getRelatedActionSummary(state, config);
  const score = calculateWorkScore(state, config, relatedActionSummary);
  const grade = getWorkGrade(score, config);
  const rewardByGrade = config.rewardByGrade ?? WORK_REWARDS_BY_GRADE;
  const narrativeByGrade = config.narrativeByGrade ?? WORK_GRADE_NARRATIVES;
  const relatedAnnualResultIds = getRelatedAnnualResults(state).map((result) => result.id);
  const relatedEventIds = getRecentEventHistory(state, 6).map((event) => event.id);

  return {
    id: `work-${config.workId}-${config.year}`,
    year: state.year,
    currentYear: config.year,
    month: config.month,
    workId: config.workId,
    title: config.title,
    theme: config.description,
    score,
    grade,
    resultLabel: WORK_GRADE_LABELS[grade],
    narrative: narrativeByGrade[grade],
    deltas: rewardByGrade[grade],
    relatedAnnualResultIds,
    relatedEventIds,
    relatedActionSummary,
    potentialVisualKey: grade === 'S' ? config.potentialVisualKey : undefined,
    createdAtMonth: config.month,
  };
}

export function buildWorkMilestones(result: WorkResult, config: ThemeNodeConfig): WorkMilestone[] {
  if (result.grade !== 'A' && result.grade !== 'S') {
    return [];
  }

  const milestoneConfig = config.milestoneByGrade?.[result.grade];
  const prefix = result.grade === 'S' ? 'work_s' : 'work_a';

  return [
    {
      id: `${prefix}_${result.workId}_${result.currentYear}`,
      year: result.year,
      currentYear: result.currentYear,
      type: 'work',
      title: milestoneConfig?.title ?? (result.grade === 'S' ? '年度作品高光' : '代表作成形'),
      description:
        milestoneConfig?.description ??
        (result.grade === 'S'
          ? '这一作品成为本阶段的关键记忆点。'
          : '这一阶段的作品开始被粉丝稳定记住。'),
      sourceWorkResultId: result.id,
      grade: result.grade,
      potentialVisualKey: result.potentialVisualKey,
    },
  ];
}

export function hasThemeNodeResult(state: GameState, nodeId: string): boolean {
  return state.themeNodeResults.some((result) => result.nodeId === nodeId);
}

export function hasWorkResult(state: GameState, workId: string): boolean {
  return state.workResults.some((result) => result.workId === workId);
}

function calculateWorkScore(
  state: GameState,
  config: ThemeNodeConfig,
  relatedActionSummary: Record<string, number>,
): number {
  const focusStats = config.focusStats ?? ['stagePower', 'supportPower', 'charm'];
  const statScore = averageStats(state, focusStats) * 0.52;
  const actionScore = getActionScore(state, config, relatedActionSummary) * 0.22;
  const annualScore = getAnnualScore(state) * 0.18;
  const eventScore = getEventScore(state) * 0.12;
  const conditionScore = getConditionScore(state) * 0.12;
  const careerPenalty = getCareerPenalty(config.year);

  return clamp(Math.round(statScore + actionScore + annualScore + eventScore + conditionScore - careerPenalty), 0, 100);
}

function averageStats(state: GameState, stats: StatKey[]): number {
  if (stats.length === 0) {
    return 0;
  }

  const total = stats.reduce((sum, stat) => {
    if (stat === 'fanCount') {
      return sum + normalizeFanCount(state.fanCount);
    }

    if (stat === 'pressure' || stat === 'fanFatigue') {
      return sum + (100 - state[stat]);
    }

    return sum + state[stat];
  }, 0);

  return total / stats.length;
}

function getActionScore(
  state: GameState,
  config: ThemeNodeConfig,
  relatedActionSummary: Record<string, number>,
): number {
  const relatedActions = new Set(config.relatedActions ?? []);
  const currentYearActions = state.planHistory.filter((entry) => entry.currentYear === state.currentYear);
  const recentActions = currentYearActions.filter((entry) => state.currentMonth - entry.currentMonth >= 0 && state.currentMonth - entry.currentMonth < 6);
  const yearlyRelated = currentYearActions.filter((entry) => relatedActions.has(entry.planId)).length;
  const recentRelated = recentActions.filter((entry) => relatedActions.has(entry.planId)).length;
  const stageSupport =
    (relatedActionSummary.stageFocus ?? 0) * 7 +
    (relatedActionSummary.theaterTraining ?? 0) * 5 +
    (relatedActionSummary.imageBuilding ?? 0) * 4 +
    (relatedActionSummary.fanService ?? 0) * 3 +
    (relatedActionSummary.stableOperation ?? 0) * 3;

  return clamp(yearlyRelated * 8 + recentRelated * 10 + stageSupport, 0, 100);
}

function getAnnualScore(state: GameState): number {
  const relatedResults = getRelatedAnnualResults(state);
  return clamp(
    relatedResults.reduce((total, result) => {
      if (result.type === 'b50') {
        if (isB50AtLeast(result.tier, 'legend')) return total + 22;
        if (isB50AtLeast(result.tier, 'highlight')) return total + 17;
        if (isB50AtLeast(result.tier, 'high')) return total + 12;
        if (isB50AtLeast(result.tier, 'ranked')) return total + 6;
      }

      if (result.type === 'election') {
        if (isElectionAtLeast(result.tier, 'center')) return total + 18;
        if (isElectionAtLeast(result.tier, 'top3')) return total + 15;
        if (isElectionAtLeast(result.tier, 'kami7')) return total + 12;
        if (isElectionAtLeast(result.tier, 'top16')) return total + 8;
        if (isElectionAtLeast(result.tier, 'ranked')) return total + 4;
      }

      return total;
    }, 0),
    0,
    100,
  );
}

function getEventScore(state: GameState): number {
  const recentEvents = getRecentEventHistory(state, 6);
  const positive = recentEvents.filter((event) => event.eventType === 'positive' || event.eventType === 'milestone').length;
  const negative = recentEvents.filter((event) => event.eventType === 'negative' || event.eventType === 'risk').length;
  const recovery = recentEvents.filter((event) => event.eventType === 'recovery').length;

  return clamp(50 + positive * 8 + recovery * 4 - negative * 9, 0, 100);
}

function getConditionScore(state: GameState): number {
  return clamp(
    62 +
      (state.stamina >= 60 ? 10 : 0) +
      (state.mood >= 70 ? 8 : 0) -
      (state.stamina < 30 ? 14 : 0) -
      (state.mood < 35 ? 12 : 0) -
      (state.pressure >= 75 ? 14 : state.pressure >= 60 ? 8 : 0) -
      (state.fanFatigue >= 75 ? 12 : state.fanFatigue >= 55 ? 6 : 0),
    0,
    100,
  );
}

function getWorkGrade(score: number, config: ThemeNodeConfig): WorkGrade {
  const thresholds = config.gradeThresholds ?? WORK_GRADE_THRESHOLDS;
  if (score >= thresholds.S) {
    return 'S';
  }

  if (score >= thresholds.A) {
    return 'A';
  }

  if (score >= thresholds.B) {
    return 'B';
  }

  return 'C';
}

function getRelatedActionSummary(state: GameState, config: ThemeNodeConfig): Record<string, number> {
  const relatedActions = new Set<PlanId>(config.relatedActions ?? []);
  return state.planHistory
    .filter((entry) => entry.currentYear === state.currentYear && relatedActions.has(entry.planId))
    .reduce<Record<string, number>>((result, entry) => {
      result[entry.planId] = (result[entry.planId] ?? 0) + 1;
      return result;
    }, {});
}

function getRelatedAnnualResults(state: GameState): AnnualResult[] {
  return state.annualResults.filter(
    (result) =>
      result.currentYear === state.currentYear ||
      (result.currentYear === state.currentYear - 1 && result.month >= 12),
  );
}

function getRecentEventHistory(state: GameState, months: number): EventHistoryEntry[] {
  return state.eventHistory.filter((event) => {
    const distance = (state.currentYear - event.currentYear) * 12 + (state.currentMonth - event.currentMonth);
    return distance >= 0 && distance < months;
  });
}

function getCareerPenalty(year: number): number {
  if (year <= 2021) {
    return 4;
  }

  if (year <= 2023) {
    return 2;
  }

  return 0;
}

function normalizeFanCount(fanCount: number): number {
  return clamp(Math.sqrt(Math.max(0, fanCount)) / Math.sqrt(6500) * 100, 0, 100);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
