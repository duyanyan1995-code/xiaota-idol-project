import { CHARACTER_IMAGES } from '../config/characterImages';
import { GALLERY_ITEMS } from '../config/gallery';
import { PLAN_BY_ID } from '../config/plans';
import { calculateB50Result, calculateElectionResult } from './nodeLogic';
import type {
  CharacterImage,
  CharacterImageKey,
  EventHistoryEntry,
  GameFeedback,
  GamePhase,
  GameSnapshot,
  GameState,
  GrowthLog,
  HalfYear,
  PlanHistoryEntry,
  PlanId,
  RandomEventChoice,
  RandomEventConfig,
  StatChange,
  StatDeltas,
  StatKey,
  YearSummary,
} from '../types/game';

const SAVE_VERSION = 2;

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
    phase: 'yearStart',
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
  if (!snapshot || snapshot.state?.saveVersion !== SAVE_VERSION) {
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
  const merged: GameState = {
    ...initial,
    ...value,
    saveVersion: SAVE_VERSION,
    planHistory: value?.planHistory ?? [],
    eventHistory: value?.eventHistory ?? [],
    b50Results: value?.b50Results ?? [],
    electionResults: value?.electionResults ?? [],
    yearSummaries: value?.yearSummaries ?? [],
    growthLogs: value?.growthLogs ?? [],
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
  return phase === 'firstHalfPlan' || phase === 'secondHalfPlan';
}

export function isEventPhase(phase: GamePhase): boolean {
  return phase === 'firstHalfEvent' || phase === 'secondHalfEvent';
}

export function advancePhase(state: GameState): GameSnapshot {
  const before = state;
  let nextState = state;
  let title = '阶段推进';
  let message = '小獭整理好状态，准备进入下一阶段。';

  if (state.phase === 'yearStart') {
    nextState = clampGameState({
      ...state,
      phase: 'firstHalfPlan',
      eventFlags: {
        ...state.eventFlags,
        summerActive: false,
      },
    });
    title = `第 ${state.year} 年开始`;
    message = '选择上半年计划，决定这一年的第一段养成方向。';
  } else if (state.phase === 'yearSummary') {
    if (state.year >= 11) {
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
      nextState = clampGameState({
        ...state,
        year: state.year + 1,
        phase: 'yearStart',
        eventFlags: {
          ...state.eventFlags,
          summerActive: false,
        },
      });
      title = `进入第 ${state.year + 1} 年`;
      message = '新的一年开始了，小獭还会继续向舞台靠近。';
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
  const half = getHalfFromPlanPhase(state.phase);
  const plan = PLAN_BY_ID[planId];

  if (!half || !plan) {
    return makeNoopSnapshot(state, '当前阶段不能选择计划。');
  }

  const before = state;
  const stateBeforeDeltas = {
    ...state,
    eventFlags: {
      ...state.eventFlags,
      summerActive: false,
    },
  };
  const afterDeltas = applyDeltas(stateBeforeDeltas, plan.effects);
  const nextPhase: GamePhase = half === 'first' ? 'firstHalfEvent' : 'secondHalfEvent';
  const historyEntry: PlanHistoryEntry = {
    id: `plan-${state.year}-${half}`,
    year: state.year,
    half,
    planId: plan.id,
    planName: plan.name,
    feedbackText: plan.feedbackText,
    effects: plan.effects,
  };
  const growthLog = createGrowthLog(
    state,
    `${plan.name}`,
    plan.feedbackText,
    plan.effects,
  );
  const nextState = clampGameState({
    ...afterDeltas,
    phase: nextPhase,
    planHistory: replaceSameYearHalfPlan(state.planHistory, historyEntry),
    growthLogs: [...state.growthLogs, growthLog],
  });

  return {
    state: nextState,
    lastPlanId: plan.id,
    lastResult: {
      title: plan.name,
      message: plan.feedbackText,
      imageKey: getPlanImageKey(plan.id),
      changes: collectChanges(before, nextState),
    },
    pendingEventId: null,
  };
}

export function applyEventChoice(
  state: GameState,
  event: RandomEventConfig,
  choice: RandomEventChoice,
): GameSnapshot {
  const half = getHalfFromEventPhase(state.phase);
  if (!half) {
    return makeNoopSnapshot(state, '当前阶段不能处理事件。');
  }

  const before = state;
  const afterDeltas = applyDeltas(state, choice.effects);
  const nextPhase: GamePhase = half === 'first' ? 'election' : 'b50';
  const eventEntry: EventHistoryEntry = {
    id: `event-${state.year}-${half}`,
    year: state.year,
    half,
    eventId: event.id,
    eventTitle: event.title,
    choiceId: choice.id,
    choiceLabel: choice.label,
    resultText: choice.resultText,
    effects: choice.effects,
    b50Bonus: choice.b50Bonus ?? 0,
    electionBonus: choice.electionBonus ?? 0,
  };
  const growthLog = createGrowthLog(state, event.title, choice.resultText, choice.effects);
  const nextState = clampGameState({
    ...afterDeltas,
    phase: nextPhase,
    eventFlags: {
      ...afterDeltas.eventFlags,
      ...(choice.flags ?? {}),
    },
    eventHistory: replaceSameYearHalfEvent(state.eventHistory, eventEntry),
    growthLogs: [...state.growthLogs, growthLog],
  });

  return {
    state: nextState,
    lastPlanId: null,
    lastResult: {
      title: event.title,
      message: choice.resultText,
      imageKey: getEventImageKey(event.id),
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
    phase: 'yearSummary',
    b50Results: replaceSameYearNodeResult(state.b50Results, result),
    growthLogs: [...state.growthLogs, growthLog],
  });
  const summary = buildYearSummary(stateWithResult);
  const nextState = clampGameState({
    ...stateWithResult,
    yearSummaries: replaceSameYearSummary(stateWithResult.yearSummaries, summary),
  });

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
      details: buildNodeDetails(result.eventBonus, result.modifiers),
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
  const nextState = clampGameState({
    ...afterRewards,
    phase: 'secondHalfPlan',
    electionResults: replaceSameYearNodeResult(state.electionResults, result),
    growthLogs: [...state.growthLogs, growthLog],
  });

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
      details: buildNodeDetails(result.eventBonus, result.modifiers),
    },
    pendingEventId: null,
  };
}

export function getCurrentYearSummary(state: GameState): YearSummary | null {
  return state.yearSummaries.find((summary) => summary.year === state.year) ?? null;
}

export function mergeUnlockedGallery(
  state: GameState,
  currentUnlocked: CharacterImageKey[],
): CharacterImageKey[] {
  const next = new Set<CharacterImageKey>(ensureBaseGallery(currentUnlocked));
  GALLERY_ITEMS.forEach((item) => {
    if (item.isUnlocked(state)) {
      next.add(item.id);
    }
  });

  return Array.from(next);
}

export function sameGalleryIds(a: CharacterImageKey[], b: CharacterImageKey[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  const bSet = new Set(b);
  return a.every((item) => bSet.has(item));
}

export function getPhaseLabel(phase: GamePhase): string {
  const labels: Record<GamePhase, string> = {
    yearStart: '年度开始',
    firstHalfPlan: '上半年计划',
    firstHalfEvent: '上半年事件',
    election: '年度人气总选',
    secondHalfPlan: '下半年计划',
    secondHalfEvent: '下半年事件',
    b50: 'B50 舞台记忆',
    yearSummary: '年度总结',
    finalEnding: '终章结算',
  };

  return labels[phase];
}

function getHalfFromPlanPhase(phase: GamePhase): HalfYear | null {
  if (phase === 'firstHalfPlan') {
    return 'first';
  }

  if (phase === 'secondHalfPlan') {
    return 'second';
  }

  return null;
}

function getHalfFromEventPhase(phase: GamePhase): HalfYear | null {
  if (phase === 'firstHalfEvent') {
    return 'first';
  }

  if (phase === 'secondHalfEvent') {
    return 'second';
  }

  return null;
}

function buildYearSummary(state: GameState): YearSummary {
  const firstPlan = state.planHistory.find(
    (entry) => entry.year === state.year && entry.half === 'first',
  );
  const secondPlan = state.planHistory.find(
    (entry) => entry.year === state.year && entry.half === 'second',
  );
  const b50Result = state.b50Results.find((result) => result.year === state.year);
  const electionResult = state.electionResults.find((result) => result.year === state.year);
  const eventTitles = state.eventHistory
    .filter((event) => event.year === state.year)
    .map((event) => event.eventTitle);

  return {
    id: `summary-${state.year}`,
    year: state.year,
    careerStage: getCareerStage(state.year),
    firstPlanName: firstPlan?.planName ?? '未选择',
    secondPlanName: secondPlan?.planName ?? '未选择',
    b50Grade: b50Result?.grade ?? 'E',
    b50Score: b50Result?.score ?? 0,
    electionGrade: electionResult?.grade ?? 'E',
    electionScore: electionResult?.score ?? 0,
    eventTitles,
    growthSummary: summarizeGrowthLogs(state.growthLogs, state.year),
    routeHint: getRouteHint(state),
  };
}

function summarizeGrowthLogs(logs: GrowthLog[], year: number): StatChange[] {
  const totals = logs
    .filter((log) => log.year === year)
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

function clampGameState(state: GameState): GameState {
  const next = { ...state };

  CONDITION_STATS.forEach((key) => {
    next[key] = clamp(Math.round(next[key]), 0, 100);
  });

  GROWTH_STATS.forEach((key) => {
    next[key] = Math.max(0, Math.round(next[key]));
  });

  next.fans = Math.max(0, Math.round(next.fans));
  next.year = clamp(Math.round(next.year), 1, 11);
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
    id: `growth-${state.year}-${state.phase}-${state.growthLogs.length + 1}`,
    year: state.year,
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

function replaceSameYearHalfPlan(
  history: PlanHistoryEntry[],
  entry: PlanHistoryEntry,
): PlanHistoryEntry[] {
  return [
    ...history.filter((item) => item.year !== entry.year || item.half !== entry.half),
    entry,
  ];
}

function replaceSameYearHalfEvent(
  history: EventHistoryEntry[],
  entry: EventHistoryEntry,
): EventHistoryEntry[] {
  return [
    ...history.filter((item) => item.year !== entry.year || item.half !== entry.half),
    entry,
  ];
}

function replaceSameYearNodeResult<T extends { year: number }>(history: T[], entry: T): T[] {
  return [...history.filter((item) => item.year !== entry.year), entry];
}

function replaceSameYearSummary(history: YearSummary[], entry: YearSummary): YearSummary[] {
  return [...history.filter((item) => item.year !== entry.year), entry];
}

function buildNodeDetails(eventBonus: number, modifiers: { label: string; value: number }[]): string[] {
  const details = [`事件加成 ${eventBonus >= 0 ? '+' : ''}${eventBonus}`];

  if (modifiers.length === 0) {
    return [...details, '状态修正 0'];
  }

  return [
    ...details,
    ...modifiers.map((modifier) => `${modifier.label} ${modifier.value >= 0 ? '+' : ''}${modifier.value}`),
  ];
}

function getPlanImageKey(planId: PlanId): CharacterImageKey | undefined {
  if (planId === 'fanService') {
    return 'wink';
  }

  if (planId === 'stageFocus') {
    return 'stage';
  }

  if (planId === 'theaterTraining') {
    return 'practice';
  }

  return undefined;
}

function getEventImageKey(eventId: string): CharacterImageKey | undefined {
  const imageByEvent: Partial<Record<string, CharacterImageKey>> = {
    fanLetter: 'happy',
    fanCreation: 'wink',
    stageMistake: 'tired',
    extraPractice: 'practice',
    styleChallenge: 'happy',
    summerInvite: 'summer',
    lowMood: 'tired',
    secretHappy: 'happy',
  };

  return imageByEvent[eventId];
}

function ensureBaseGallery(ids: CharacterImageKey[]): CharacterImageKey[] {
  return Array.from(new Set<CharacterImageKey>(['base', ...ids]));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
