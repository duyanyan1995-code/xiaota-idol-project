import {
  CAREER_END_YEAR,
  CAREER_START_YEAR,
  MONTHS_PER_YEAR,
  getAnnualCalendar,
  getCareerYear,
  isFinalCareerMonth,
} from '../config/annualCalendar';
import { CHARACTER_IMAGES } from '../config/characterImages';
import { FALLBACK_EVENT, RANDOM_EVENTS } from '../config/events';
import { GALLERY_ITEMS } from '../config/gallery';
import { PLAN_BY_ID } from '../config/plans';
import { calculateB50Result, calculateElectionResult } from './nodeLogic';
import { formatMonthlyActionLabel, formatYearMonth } from './dateDisplay';
import { getPlanLockedReason, isPlanUnlocked } from './unlockLogic';
import type {
  CharacterImage,
  CharacterImageKey,
  EventHistoryEntry,
  GameFeedback,
  GamePhase,
  GameSnapshot,
  GameState,
  GalleryId,
  GrowthLog,
  NodeResult,
  PlanHistoryEntry,
  PlanId,
  RandomEventChoice,
  RandomEventConfig,
  StatChange,
  StatDeltas,
  StatKey,
  YearSummary,
} from '../types/game';

const SAVE_VERSION = 4;
const SUPPORTED_SAVE_VERSIONS = [2, 3, 4];

const CONDITION_STATS = ['energy', 'mood', 'stress'] as const;
const GROWTH_STATS = [
  'vocal',
  'dance',
  'performance',
  'charm',
  'popularity',
  'fanLoyalty',
  'resources',
  'style',
] as const;

const STAT_LABELS: Record<StatKey, string> = {
  vocal: '唱功',
  dance: '舞蹈',
  performance: '舞台表现',
  charm: '魅力',
  popularity: '人气',
  fanLoyalty: '粉丝黏性',
  resources: '资源',
  style: '风格',
  energy: '体力',
  mood: '心情',
  stress: '压力',
  fans: '粉丝数',
};

export function createInitialGameState(): GameState {
  return {
    saveVersion: SAVE_VERSION,
    year: 1,
    currentYear: CAREER_START_YEAR,
    currentMonth: 1,
    phase: 'monthStart',
    vocal: 10,
    dance: 10,
    performance: 10,
    charm: 12,
    popularity: 0,
    fans: 50,
    fanLoyalty: 10,
    resources: 0,
    style: 10,
    energy: 80,
    mood: 75,
    stress: 10,
    planHistory: [],
    eventHistory: [],
    b50Results: [],
    electionResults: [],
    yearSummaries: [],
    growthLogs: [],
    unlockedGallery: ['base'],
    eventFlags: {},
    gameStatus: 'playing',
  };
}

export function normalizeGameSnapshot(snapshot: GameSnapshot | null): GameSnapshot | null {
  const saveVersion = snapshot?.state?.saveVersion;
  if (!snapshot || !SUPPORTED_SAVE_VERSIONS.includes(Number(saveVersion))) {
    return null;
  }

  return {
    state: normalizeGameState(snapshot.state),
    lastPlanId: snapshot.lastPlanId ?? null,
    lastResult: snapshot.lastResult ?? null,
    pendingEventId: snapshot.pendingEventId ?? null,
  };
}

export function normalizeGameState(value: Partial<GameState> | null | undefined): GameState {
  const initial = createInitialGameState();
  const currentYear = normalizeCurrentYear(value);
  const currentMonth = normalizeCurrentMonth(value);
  const phase = normalizePhase((value as { phase?: string } | null | undefined)?.phase);
  const merged: GameState = {
    ...initial,
    ...value,
    saveVersion: SAVE_VERSION,
    year: getCareerYear(currentYear),
    currentYear,
    currentMonth,
    phase,
    planHistory: normalizePlanHistory(value?.planHistory ?? []),
    eventHistory: normalizeEventHistory(value?.eventHistory ?? []),
    b50Results: normalizeNodeResults(value?.b50Results ?? []),
    electionResults: normalizeNodeResults(value?.electionResults ?? []),
    yearSummaries: normalizeYearSummaries(value?.yearSummaries ?? []),
    growthLogs: normalizeGrowthLogs(value?.growthLogs ?? []),
    unlockedGallery: ensureBaseGallery(value?.unlockedGallery ?? initial.unlockedGallery),
    eventFlags: value?.eventFlags ?? {},
    gameStatus: value?.gameStatus ?? 'playing',
  };

  return clampGameState(merged);
}

export function getCharacterImage(
  gameState: GameState,
  lastPlanId: PlanId | null,
): CharacterImage {
  if (gameState.energy < 30) {
    return CHARACTER_IMAGES.tired;
  }

  if (gameState.eventFlags.summerActive) {
    return CHARACTER_IMAGES.summer;
  }

  if (lastPlanId === 'fanService') {
    return CHARACTER_IMAGES.wink;
  }

  if (gameState.phase === 'b50' || gameState.phase === 'election' || lastPlanId === 'stageFocus') {
    return CHARACTER_IMAGES.stage;
  }

  if (
    lastPlanId === 'theaterTraining' ||
    lastPlanId === 'imageBuilding' ||
    lastPlanId === 'stableOperation'
  ) {
    return CHARACTER_IMAGES.practice;
  }

  if (gameState.mood > 85) {
    return CHARACTER_IMAGES.happy;
  }

  return CHARACTER_IMAGES.base;
}

export function isPlanPhase(phase: GamePhase): boolean {
  return phase === 'monthlyPlan';
}

export function isEventPhase(phase: GamePhase): boolean {
  return phase === 'monthlyEvent';
}

export function advancePhase(state: GameState): GameSnapshot {
  const before = state;
  let nextState = state;
  let title = '阶段推进';
  let message = '小獭整理好状态，准备进入下一阶段。';

  if (state.phase === 'monthStart') {
    nextState = clampGameState({
      ...state,
      phase: 'monthlyPlan',
      eventFlags: {
        ...state.eventFlags,
        summerActive: false,
      },
    });
    title = formatYearMonth(state.currentYear, state.currentMonth);
    message = '选择本月行动，决定这个月的小獭如何积累。';
  } else if (state.phase === 'yearSummary') {
    if (isFinalCareerMonth(state.currentYear, state.currentMonth)) {
      nextState = clampGameState({
        ...state,
        phase: 'finalEnding',
        gameStatus: 'completed',
        eventFlags: {
          ...state.eventFlags,
          summerActive: false,
        },
      });
      title = '十一年终章';
      message = '小獭的 11 年偶像生涯走到了终章结算。';
    } else {
      nextState = advanceToNextMonth(state);
      title = formatYearMonth(nextState.currentYear, nextState.currentMonth);
      message = '新的月份开始了，小獭还会继续向舞台靠近。';
    }
  }

  return {
    state: nextState,
    lastPlanId: null,
    lastResult: {
      title,
      message,
      changes: collectChanges(before, nextState),
    },
    pendingEventId: null,
  };
}

export function applyPlan(state: GameState, planId: PlanId): GameSnapshot {
  const plan = PLAN_BY_ID[planId];

  if (state.phase !== 'monthlyPlan' || !plan) {
    return makeNoopSnapshot(state, '当前阶段不能选择行动。');
  }

  if (!isPlanUnlocked(plan, state)) {
    return makeNoopSnapshot(state, getPlanLockedReason(plan, state));
  }

  const before = state;
  const stateBeforeDeltas = {
    ...state,
    eventFlags: {
      ...state.eventFlags,
      summerActive: false,
    },
  };
  const actualEffects = rollPlanEffects(plan);
  const afterDeltas = applyDeltas(stateBeforeDeltas, actualEffects);
  const historyEntry: PlanHistoryEntry = {
    id: `plan-${state.currentYear}-${state.currentMonth}`,
    year: state.year,
    currentYear: state.currentYear,
    currentMonth: state.currentMonth,
    planId: plan.id,
    planName: plan.name,
    actionVisualKey: plan.actionVisualKey,
    feedbackText: plan.feedbackText,
    effects: actualEffects,
  };
  const growthLog = createGrowthLog(
    state,
    `${plan.name}`,
    plan.feedbackText,
    actualEffects,
  );
  const nextState = clampGameState({
    ...afterDeltas,
    phase: 'monthlyEvent',
    planHistory: replaceSameMonthPlan(state.planHistory, historyEntry),
    growthLogs: [...state.growthLogs, growthLog],
  });

  return {
    state: nextState,
    lastPlanId: plan.id,
    lastResult: {
      title: plan.name,
      message: plan.feedbackText,
      visual: {
        type: 'actionVisual',
        key: plan.actionVisualKey,
      },
      changes: collectChanges(before, nextState),
    },
    pendingEventId: null,
  };
}

export function resolveNoEventAfterPlan(state: GameState): GameSnapshot {
  if (state.phase !== 'monthlyEvent') {
    return makeNoopSnapshot(state, '当前阶段不能跳过事件。');
  }

  return {
    state: resolveAfterMonthActivity(state),
    lastPlanId: null,
    lastResult: null,
    pendingEventId: null,
  };
}

export function applyEventChoice(
  state: GameState,
  event: RandomEventConfig,
  choice: RandomEventChoice,
): GameSnapshot {
  if (state.phase !== 'monthlyEvent') {
    return makeNoopSnapshot(state, '当前阶段不能处理事件。');
  }

  const before = state;
  const afterDeltas = applyDeltas(state, choice.effects);
  const eventEntry: EventHistoryEntry = {
    id: `event-${state.currentYear}-${state.currentMonth}`,
    year: state.year,
    currentYear: state.currentYear,
    currentMonth: state.currentMonth,
    eventId: event.id,
    eventTitle: event.title,
    choiceId: choice.id,
    choiceLabel: choice.label,
    resultText: choice.resultText,
    eventCgKey: event.eventCgKey,
    galleryId: event.galleryId,
    effects: choice.effects,
    b50Bonus: choice.b50Bonus ?? 0,
    electionBonus: choice.electionBonus ?? 0,
  };
  const growthLog = createGrowthLog(state, event.title, choice.resultText, choice.effects);
  const stateWithEvent = clampGameState({
    ...afterDeltas,
    eventFlags: {
      ...afterDeltas.eventFlags,
      ...(choice.flags ?? {}),
    },
    eventHistory: replaceSameMonthEvent(state.eventHistory, eventEntry),
    unlockedGallery: event.galleryId
      ? addGalleryId(state.unlockedGallery, event.galleryId)
      : state.unlockedGallery,
    growthLogs: [...state.growthLogs, growthLog],
  });
  const nextState = resolveAfterMonthActivity(stateWithEvent);

  return {
    state: nextState,
    lastPlanId: null,
    lastResult: {
      title: event.title,
      message: choice.resultText,
      visual: event.eventCgKey
        ? {
            type: 'eventCg',
            key: event.eventCgKey,
          }
        : undefined,
      suppressFallbackVisual: !event.eventCgKey,
      changes: collectChanges(before, nextState),
    },
    pendingEventId: null,
  };
}

export function resolveB50Node(state: GameState): GameSnapshot {
  if (state.phase !== 'b50') {
    return makeNoopSnapshot(state, '当前阶段不能进行 B50 结算。');
  }

  const before = state;
  const result = calculateB50Result(state);
  const afterRewards = applyDeltas(state, result.rewards);
  const growthLog = createGrowthLog(state, 'B50 舞台记忆节点', result.message, result.rewards);
  const stateWithResult = clampGameState({
    ...afterRewards,
    b50Results: replaceSameYearNodeResult(state.b50Results, result),
    growthLogs: [...state.growthLogs, growthLog],
  });
  const nextState = isYearEndMonth(stateWithResult)
    ? buildYearSummaryState(stateWithResult)
    : advanceToNextMonth(stateWithResult);

  return {
    state: nextState,
    lastPlanId: null,
    lastResult: {
      title: 'B50 舞台记忆节点',
      message: result.message,
      score: result.score,
      grade: result.grade,
      imageKey: result.score >= 60 ? 'stage' : undefined,
      changes: collectChanges(before, nextState),
      details: buildNodeDetails(result),
    },
    pendingEventId: null,
  };
}

export function resolveElectionNode(state: GameState): GameSnapshot {
  if (state.phase !== 'election') {
    return makeNoopSnapshot(state, '当前阶段不能进行总选结算。');
  }

  const before = state;
  const result = calculateElectionResult(state);
  const afterRewards = applyDeltas(state, result.rewards);
  const growthLog = createGrowthLog(state, '年度人气总选节点', result.message, result.rewards);
  const stateWithResult = clampGameState({
    ...afterRewards,
    electionResults: replaceSameYearNodeResult(state.electionResults, result),
    growthLogs: [...state.growthLogs, growthLog],
  });
  const nextState = resolveAfterNode(stateWithResult);

  return {
    state: nextState,
    lastPlanId: null,
    lastResult: {
      title: '年度人气总选节点',
      message: result.message,
      score: result.score,
      grade: result.grade,
      imageKey: result.score >= 60 ? 'happy' : undefined,
      changes: collectChanges(before, nextState),
      details: buildNodeDetails(result),
    },
    pendingEventId: null,
  };
}

export function getCurrentYearSummary(state: GameState): YearSummary | null {
  return state.yearSummaries.find((summary) => summary.currentYear === state.currentYear) ?? null;
}

export function mergeUnlockedGallery(
  state: GameState,
  currentUnlocked: GalleryId[],
): GalleryId[] {
  const next = new Set<GalleryId>(ensureBaseGallery(currentUnlocked));
  state.unlockedGallery.forEach((id) => next.add(id));
  GALLERY_ITEMS.forEach((item) => {
    if (item.isUnlocked(state)) {
      next.add(item.id);
    }
  });

  return Array.from(next);
}

export function sameGalleryIds(a: GalleryId[], b: GalleryId[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  const bSet = new Set(b);
  return a.every((item) => bSet.has(item));
}

export function getPhaseLabel(phase: GamePhase): string {
  const labels: Record<GamePhase, string> = {
    monthStart: '月份开始',
    monthlyPlan: '本月行动',
    monthlyEvent: '本月事件',
    election: '本月总选',
    b50: '本月 B50',
    yearSummary: '年度总结',
    finalEnding: '终章结算',
  };

  return labels[phase];
}

export function getMonthLabel(state: GameState): string {
  return formatYearMonth(state.currentYear, state.currentMonth);
}

function resolveAfterMonthActivity(state: GameState): GameState {
  if (shouldResolveElection(state)) {
    return clampGameState({
      ...state,
      phase: 'election',
    });
  }

  return resolveAfterNode(state);
}

function resolveAfterNode(state: GameState): GameState {
  if (shouldResolveB50(state)) {
    return clampGameState({
      ...state,
      phase: 'b50',
    });
  }

  if (isYearEndMonth(state)) {
    return buildYearSummaryState(state);
  }

  return advanceToNextMonth(state);
}

function shouldResolveElection(state: GameState): boolean {
  const calendar = getAnnualCalendar(state.currentYear);
  return (
    calendar.electionMonth === state.currentMonth &&
    !hasNodeResult(state.electionResults, state.currentYear)
  );
}

function shouldResolveB50(state: GameState): boolean {
  const calendar = getAnnualCalendar(state.currentYear);
  return (
    calendar.b50Month === state.currentMonth &&
    !hasNodeResult(state.b50Results, state.currentYear)
  );
}

function hasNodeResult(history: { currentYear: number; year: number }[], currentYear: number): boolean {
  return history.some((item) => item.currentYear === currentYear);
}

function isYearEndMonth(state: GameState): boolean {
  return state.currentMonth === MONTHS_PER_YEAR;
}

function advanceToNextMonth(state: GameState): GameState {
  const isDecember = state.currentMonth >= MONTHS_PER_YEAR;
  const nextYear = isDecember ? state.currentYear + 1 : state.currentYear;
  const nextMonth = isDecember ? 1 : state.currentMonth + 1;

  return clampGameState({
    ...state,
    currentYear: nextYear,
    currentMonth: nextMonth,
    phase: 'monthStart',
    eventFlags: {
      ...state.eventFlags,
      summerActive: false,
    },
  });
}

function buildYearSummaryState(state: GameState): GameState {
  const summary = buildYearSummary(state);
  return clampGameState({
    ...state,
    phase: 'yearSummary',
    yearSummaries: replaceSameYearSummary(state.yearSummaries, summary),
  });
}

function buildYearSummary(state: GameState): YearSummary {
  const yearlyPlans = state.planHistory.filter(
    (entry) => entry.currentYear === state.currentYear,
  );
  const b50Result = state.b50Results.find((result) => result.currentYear === state.currentYear);
  const electionResult = state.electionResults.find(
    (result) => result.currentYear === state.currentYear,
  );
  const eventTitles = state.eventHistory
    .filter((event) => event.currentYear === state.currentYear)
    .map((event) => event.eventTitle);

  return {
    id: `summary-${state.currentYear}`,
    year: state.year,
    currentYear: state.currentYear,
    careerStage: getCareerStage(state.year),
    planNames: yearlyPlans.map((plan) => formatMonthlyActionLabel(plan.currentMonth, plan.planName)),
    b50Grade: b50Result?.grade ?? 'E',
    b50Score: b50Result?.score ?? 0,
    electionGrade: electionResult?.grade ?? 'E',
    electionScore: electionResult?.score ?? 0,
    eventTitles,
    growthSummary: summarizeGrowthLogs(state.growthLogs, state.currentYear),
    routeHint: getRouteHint(state),
  };
}

function summarizeGrowthLogs(logs: GrowthLog[], currentYear: number): StatChange[] {
  const totals = logs
    .filter((log) => log.currentYear === currentYear)
    .reduce<Partial<Record<StatKey, number>>>((result, log) => {
      Object.entries(log.deltas).forEach(([key, value]) => {
        if (value === undefined) {
          return;
        }

        const statKey = key as StatKey;
        result[statKey] = (result[statKey] ?? 0) + value;
      });

      return result;
    }, {});

  return Object.entries(totals)
    .map(([key, value]) => ({
      key: key as StatKey,
      label: STAT_LABELS[key as StatKey],
      before: 0,
      after: value ?? 0,
      delta: value ?? 0,
    }))
    .filter((change) => change.delta !== 0);
}

function getCareerStage(year: number): string {
  if (year <= 2) {
    return '新人期';
  }

  if (year <= 5) {
    return '成长期';
  }

  if (year <= 8) {
    return '突破期';
  }

  if (year <= 10) {
    return '成熟期';
  }

  return '终章年';
}

function getRouteHint(state: GameState): string {
  if (state.stress >= 70) {
    return '需要注意状态，小獭已经背着不少压力了。';
  }

  const routes = [
    { value: state.performance, text: '舞台实力派路线正在成形。' },
    { value: state.fanLoyalty, text: '长期陪伴路线正在变得清晰。' },
    { value: state.popularity, text: '人气突破路线有明显机会。' },
    { value: state.style, text: '可瓜可花的风格路线越来越鲜明。' },
  ];

  return routes.sort((a, b) => b.value - a.value)[0].text;
}

function applyDeltas(state: GameState, deltas: StatDeltas): GameState {
  const changedValues = Object.entries(deltas).reduce<Partial<GameState>>(
    (result, [key, value]) => {
      if (value === undefined) {
        return result;
      }

      const statKey = key as StatKey;
      return {
        ...result,
        [statKey]: state[statKey] + value,
      };
    },
    {},
  );

  return clampGameState({
    ...state,
    ...changedValues,
  });
}

function rollPlanEffects(plan: { effects: StatDeltas; effectsRange?: Partial<Record<StatKey, [number, number]>> }): StatDeltas {
  const rangeKeys = Object.keys(plan.effectsRange ?? {}) as StatKey[];
  const fallbackKeys = Object.keys(plan.effects) as StatKey[];
  const keys = Array.from(new Set<StatKey>([...fallbackKeys, ...rangeKeys]));

  return keys.reduce<StatDeltas>((result, key) => {
    const range = plan.effectsRange?.[key];
    const fallback = plan.effects[key];

    if (range) {
      return {
        ...result,
        [key]: randomIntInRange(range[0], range[1]),
      };
    }

    if (fallback !== undefined) {
      return {
        ...result,
        [key]: fallback,
      };
    }

    return result;
  }, {});
}

function randomIntInRange(min: number, max: number): number {
  const low = Math.ceil(Math.min(min, max));
  const high = Math.floor(Math.max(min, max));
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

function clampGameState(state: GameState): GameState {
  const next = { ...state };

  next.currentYear = clamp(Math.round(next.currentYear), CAREER_START_YEAR, CAREER_END_YEAR);
  next.currentMonth = clamp(Math.round(next.currentMonth), 1, MONTHS_PER_YEAR);
  next.year = getCareerYear(next.currentYear);

  CONDITION_STATS.forEach((key) => {
    next[key] = clamp(Math.round(next[key]), 0, 100);
  });

  GROWTH_STATS.forEach((key) => {
    next[key] = Math.max(0, Math.round(next[key]));
  });

  next.fans = Math.max(0, Math.round(next.fans));
  next.unlockedGallery = ensureBaseGallery(next.unlockedGallery);

  return next;
}

function collectChanges(before: GameState, after: GameState): StatChange[] {
  const keys: StatKey[] = [
    'energy',
    'mood',
    'stress',
    'vocal',
    'dance',
    'performance',
    'charm',
    'popularity',
    'fanLoyalty',
    'resources',
    'style',
    'fans',
  ];

  return keys
    .filter((key) => before[key] !== after[key])
    .map((key) => ({
      key,
      label: STAT_LABELS[key],
      before: before[key],
      after: after[key],
      delta: after[key] - before[key],
    }));
}

function createGrowthLog(
  state: GameState,
  title: string,
  description: string,
  deltas: StatDeltas,
): GrowthLog {
  return {
    id: `growth-${state.currentYear}-${state.currentMonth}-${state.phase}-${state.growthLogs.length + 1}`,
    year: state.year,
    currentYear: state.currentYear,
    currentMonth: state.currentMonth,
    phase: state.phase,
    title,
    description,
    deltas,
  };
}

function makeNoopSnapshot(state: GameState, message: string): GameSnapshot {
  return {
    state,
    lastPlanId: null,
    lastResult: {
      title: '无法推进',
      message,
      changes: [],
    },
    pendingEventId: null,
  };
}

function replaceSameMonthPlan(
  history: PlanHistoryEntry[],
  entry: PlanHistoryEntry,
): PlanHistoryEntry[] {
  return [
    ...history.filter(
      (item) =>
        item.currentYear !== entry.currentYear || item.currentMonth !== entry.currentMonth,
    ),
    entry,
  ];
}

function replaceSameMonthEvent(
  history: EventHistoryEntry[],
  entry: EventHistoryEntry,
): EventHistoryEntry[] {
  return [
    ...history.filter(
      (item) =>
        item.currentYear !== entry.currentYear || item.currentMonth !== entry.currentMonth,
    ),
    entry,
  ];
}

function replaceSameYearNodeResult<T extends { currentYear: number }>(history: T[], entry: T): T[] {
  return [...history.filter((item) => item.currentYear !== entry.currentYear), entry];
}

function replaceSameYearSummary(history: YearSummary[], entry: YearSummary): YearSummary[] {
  return [...history.filter((item) => item.currentYear !== entry.currentYear), entry];
}

function buildNodeDetails(result: NodeResult): string[] {
  const details = [
    result.rankLabel ? `档位 ${result.rankLabel}` : null,
    `事件加成 ${result.eventBonus >= 0 ? '+' : ''}${result.eventBonus}`,
    ...result.modifiers.map((modifier) => `${modifier.label} ${modifier.value >= 0 ? '+' : ''}${modifier.value}`),
    ...(result.mainFactors ?? []).map((factor) => `贡献：${factor}`),
    ...(result.bonusFactors ?? []).map((factor) => `加成：${factor}`),
    ...(result.penaltyFactors ?? []).map((factor) => `拖累：${factor}`),
  ].filter(Boolean) as string[];

  return details.length > 0 ? details : ['状态修正 0'];
}

function normalizeCurrentYear(value: Partial<GameState> | null | undefined): number {
  if (typeof value?.currentYear === 'number') {
    return clamp(Math.round(value.currentYear), CAREER_START_YEAR, CAREER_END_YEAR);
  }

  return clamp(
    CAREER_START_YEAR + clamp(Math.round(value?.year ?? 1), 1, 11) - 1,
    CAREER_START_YEAR,
    CAREER_END_YEAR,
  );
}

function normalizeCurrentMonth(value: Partial<GameState> | null | undefined): number {
  if (typeof value?.currentMonth === 'number') {
    return clamp(Math.round(value.currentMonth), 1, MONTHS_PER_YEAR);
  }

  const legacyPhase = (value as { phase?: string } | null | undefined)?.phase;
  if (legacyPhase === 'secondHalfPlan' || legacyPhase === 'secondHalfEvent' || legacyPhase === 'b50' || legacyPhase === 'yearSummary') {
    return 12;
  }

  if (legacyPhase === 'election') {
    return 7;
  }

  return 1;
}

function normalizePhase(phase: string | undefined): GamePhase {
  if (
    phase === 'monthStart' ||
    phase === 'monthlyPlan' ||
    phase === 'monthlyEvent' ||
    phase === 'election' ||
    phase === 'b50' ||
    phase === 'yearSummary' ||
    phase === 'finalEnding'
  ) {
    return phase;
  }

  if (phase === 'firstHalfPlan' || phase === 'secondHalfPlan') {
    return 'monthlyPlan';
  }

  if (phase === 'firstHalfEvent' || phase === 'secondHalfEvent') {
    return 'monthlyEvent';
  }

  if (phase === 'yearStart') {
    return 'monthStart';
  }

  return 'monthStart';
}

function normalizePlanHistory(history: PlanHistoryEntry[]): PlanHistoryEntry[] {
  return history.map((entry) => {
    const currentYear = entry.currentYear ?? CAREER_START_YEAR + clamp(Math.round(entry.year ?? 1), 1, 11) - 1;
    const currentMonth = entry.currentMonth ?? (entry.half === 'second' ? 7 : 1);

    return {
      ...entry,
      currentYear,
      currentMonth,
      actionVisualKey: entry.actionVisualKey ?? PLAN_BY_ID[entry.planId]?.actionVisualKey,
    };
  });
}

function normalizeEventHistory(history: EventHistoryEntry[]): EventHistoryEntry[] {
  return history.map((entry) => {
    const event = getEventConfig(entry.eventId);
    const currentYear = entry.currentYear ?? CAREER_START_YEAR + clamp(Math.round(entry.year ?? 1), 1, 11) - 1;
    const currentMonth = entry.currentMonth ?? (entry.half === 'second' ? 7 : 1);

    return {
      ...entry,
      currentYear,
      currentMonth,
      eventCgKey: entry.eventCgKey ?? event?.eventCgKey,
      galleryId: entry.galleryId ?? event?.galleryId,
    };
  });
}

function normalizeNodeResults<T extends { year: number; currentYear: number; currentMonth: number }>(
  history: T[],
): T[] {
  return history.map((entry) => ({
    ...entry,
    currentYear: entry.currentYear ?? CAREER_START_YEAR + clamp(Math.round(entry.year ?? 1), 1, 11) - 1,
    currentMonth: entry.currentMonth ?? 12,
  }));
}

function normalizeYearSummaries(history: YearSummary[]): YearSummary[] {
  return history.map((entry) => ({
    ...entry,
    currentYear: entry.currentYear ?? CAREER_START_YEAR + clamp(Math.round(entry.year ?? 1), 1, 11) - 1,
    planNames: entry.planNames ?? [],
  }));
}

function normalizeGrowthLogs(history: GrowthLog[]): GrowthLog[] {
  return history.map((entry) => ({
    ...entry,
    currentYear: entry.currentYear ?? CAREER_START_YEAR + clamp(Math.round(entry.year ?? 1), 1, 11) - 1,
    currentMonth: entry.currentMonth ?? 1,
    phase: normalizePhase((entry as { phase?: string }).phase),
  }));
}

function getEventConfig(eventId: string) {
  if (eventId === FALLBACK_EVENT.id) {
    return FALLBACK_EVENT;
  }

  return RANDOM_EVENTS.find((event) => event.id === eventId);
}

function addGalleryId(ids: GalleryId[], id: GalleryId): GalleryId[] {
  return Array.from(new Set<GalleryId>(['base', ...ids, id]));
}

function ensureBaseGallery(ids: GalleryId[]): GalleryId[] {
  return Array.from(new Set<GalleryId>(['base', ...ids]));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
