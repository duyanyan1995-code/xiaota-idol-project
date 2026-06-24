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
import {
  DEFAULT_WORK_GRADE,
  LEGACY_STAT_KEY_MAP,
  STAT_CONFIGS,
  STAT_CONFIG_BY_ID,
  getInitialStatValue,
  isValidWorkGrade,
  toCurrentStatKey,
} from '../config/stats';
import { getVisualAsset } from '../config/visualAssets';
import { calculateB50Result, calculateElectionResult } from './nodeLogic';
import { formatMonthlyActionLabel, formatYearMonth } from './dateDisplay';
import { isB50AtLeast, isElectionAtLeast } from './routeLogic';
import { getPlanLockedReason, isPlanUnlocked } from './unlockLogic';
import {
  buildThemeNodeResult,
  buildWorkMilestones,
  buildWorkResult,
  getThemeNodeConfigForState,
} from './workLogic';
import {
  ensureMonthlyActionOptions,
  findMonthlyActionOption,
  rollActionVariant,
} from './actionRoll';
import type {
  CharacterImage,
  CharacterImageKey,
  AnnualResult,
  AnnualResultType,
  EventHistoryEntry,
  GallerySourceType,
  GalleryUnlockRecord,
  GameFeedback,
  GamePhase,
  GameSnapshot,
  GameState,
  GalleryId,
  WorkCgKey,
  GrowthLog,
  Milestone,
  MonthlyActionOption,
  NodeResult,
  NodeGrade,
  NodeTier,
  PlanHistoryEntry,
  PlanId,
  RandomEventChoice,
  RandomEventConfig,
  StatChange,
  StatDeltas,
  StatKey,
  ThemeNodeResult,
  VisualUnlock,
  WorkMilestone,
  WorkResult,
  YearSummary,
} from '../types/game';

const SAVE_VERSION = 10;
const SUPPORTED_SAVE_VERSIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10];

export function createInitialGameState(): GameState {
  return {
    saveVersion: SAVE_VERSION,
    year: 1,
    currentYear: CAREER_START_YEAR,
    currentMonth: 1,
    phase: 'monthStart',
    stamina: getInitialStatValue('stamina'),
    mood: getInitialStatValue('mood'),
    pressure: getInitialStatValue('pressure'),
    vocal: getInitialStatValue('vocal'),
    dance: getInitialStatValue('dance'),
    stagePower: getInitialStatValue('stagePower'),
    fanCount: getInitialStatValue('fanCount'),
    supportPower: getInitialStatValue('supportPower'),
    influence: getInitialStatValue('influence'),
    resource: getInitialStatValue('resource'),
    charm: getInitialStatValue('charm'),
    operation: getInitialStatValue('operation'),
    fanFatigue: getInitialStatValue('fanFatigue'),
    workGrade: DEFAULT_WORK_GRADE,
    pendingEventId: null,
    monthlyActionOptions: [],
    planHistory: [],
    eventHistory: [],
    eventCooldowns: {},
    riskWarningCounts: {},
    b50Results: [],
    electionResults: [],
    annualResults: [],
    milestones: [],
    themeNodeResults: [],
    workResults: [],
    workMilestones: [],
    pendingThemeNodeResult: null,
    pendingWorkResult: null,
    unlockedGalleryIds: [],
    galleryUnlockHistory: [],
    pendingVisualUnlock: null,
    seenVisualUnlockIds: [],
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
  const stateWithPendingEvent = {
    ...snapshot.state,
    pendingEventId: snapshot.pendingEventId ?? snapshot.state.pendingEventId ?? null,
  };
  const state = normalizeGameState(stateWithPendingEvent);

  return {
    state,
    lastPlanId: snapshot.lastPlanId ?? null,
    lastResult: snapshot.lastResult ? normalizeFeedback(snapshot.lastResult) : null,
    pendingEventId: snapshot.pendingEventId ?? state.pendingEventId ?? null,
  };
}

export function normalizeGameState(value: Partial<GameState> | null | undefined): GameState {
  const initial = createInitialGameState();
  const source = value as Record<string, unknown> | null | undefined;
  const currentYear = normalizeCurrentYear(value);
  const currentMonth = normalizeCurrentMonth(value);
  const phase = normalizePhase((value as { phase?: string } | null | undefined)?.phase);
  const migratedStats = buildMigratedStats(source, initial);
  const merged: GameState = {
    ...initial,
    ...value,
    ...migratedStats,
    saveVersion: SAVE_VERSION,
    year: getCareerYear(currentYear),
    currentYear,
    currentMonth,
    phase,
    planHistory: normalizePlanHistory(value?.planHistory ?? []),
    eventHistory: normalizeEventHistory(value?.eventHistory ?? []),
    b50Results: normalizeNodeResults(value?.b50Results ?? []),
    electionResults: normalizeNodeResults(value?.electionResults ?? []),
    annualResults: normalizeAnnualResults(value?.annualResults ?? []),
    milestones: normalizeMilestones(value?.milestones ?? []),
    themeNodeResults: normalizeThemeNodeResults(value?.themeNodeResults ?? []),
    workResults: normalizeWorkResults(value?.workResults ?? []),
    workMilestones: normalizeWorkMilestones(value?.workMilestones ?? []),
    pendingThemeNodeResult: normalizeNullableThemeNodeResult(value?.pendingThemeNodeResult ?? null),
    pendingWorkResult: normalizeNullableWorkResult(value?.pendingWorkResult ?? null),
    unlockedGalleryIds: normalizeGalleryIds([
      ...(Array.isArray(value?.unlockedGalleryIds) ? value.unlockedGalleryIds : []),
      ...(Array.isArray(value?.unlockedGallery) ? value.unlockedGallery.filter((id) => id !== 'base') : []),
    ]),
    galleryUnlockHistory: normalizeGalleryUnlockHistory(value?.galleryUnlockHistory ?? []),
    pendingVisualUnlock: normalizeNullableVisualUnlock(value?.pendingVisualUnlock ?? null),
    seenVisualUnlockIds: normalizeGalleryIds(value?.seenVisualUnlockIds ?? []),
    yearSummaries: normalizeYearSummaries(value?.yearSummaries ?? []),
    growthLogs: normalizeGrowthLogs(value?.growthLogs ?? []),
    unlockedGallery: ensureBaseGallery(value?.unlockedGallery ?? initial.unlockedGallery),
    eventFlags: value?.eventFlags ?? {},
    pendingEventId: typeof value?.pendingEventId === 'string' ? value.pendingEventId : null,
    eventCooldowns: normalizeNumberRecord(value?.eventCooldowns),
    riskWarningCounts: normalizeNumberRecord(value?.riskWarningCounts),
    gameStatus: phase === 'flamePrelude' ? 'playing' : value?.gameStatus ?? 'playing',
    workGrade: isValidWorkGrade(source?.workGrade) ? source.workGrade : initial.workGrade,
    monthlyActionOptions: normalizeMonthlyActionOptions(value?.monthlyActionOptions ?? []),
  };

  return ensureMonthlyActionOptions(clampGameState(merged));
}

export function getCharacterImage(
  gameState: GameState,
  lastPlanId: PlanId | null,
): CharacterImage {
  if (gameState.stamina < 30) {
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

  if (state.pendingVisualUnlock) {
    nextState = consumePendingVisualUnlock(state);
    title = '视觉记忆已收录';
    message = '这份记忆已经加入图鉴，后续可以随时回看。';
  } else if (state.phase === 'monthStart') {
    nextState = ensureMonthlyActionOptions(clampGameState({
      ...state,
      phase: 'monthlyPlan',
      eventFlags: {
        ...state.eventFlags,
        summerActive: false,
      },
    }));
    title = formatYearMonth(state.currentYear, state.currentMonth);
    message = '选择本月行动，决定这个月的小獭如何积累。';
  } else if (state.phase === 'yearSummary') {
    if (isFinalCareerMonth(state.currentYear, state.currentMonth)) {
      nextState = clampGameState({
        ...state,
        // TODO Phase 8: 接入 2026 FLAME 终章、最终总选与正式结局判定。
        phase: 'flamePrelude',
        gameStatus: 'playing',
        eventFlags: {
          ...state.eventFlags,
          summerActive: false,
        },
      });
      title = '即将进入 2026 FLAME 终章';
      message = '2015—2025 的主养成期已经完成。2026 终章、最终总选、FLAME 舞台和结局判定会在后续 Phase 中开放。';
    } else {
      nextState = advanceToNextMonth(state);
      title = formatYearMonth(nextState.currentYear, nextState.currentMonth);
      message = '新的月份开始了，小獭还会继续向舞台靠近。';
    }
  } else if (state.phase === 'themeNode' || state.phase === 'workNode') {
    const pendingWorkResult = state.pendingWorkResult;
    const stateAfterThemeNode = clampGameState({
      ...state,
      pendingThemeNodeResult: null,
      pendingWorkResult: null,
    });
    nextState = applyVisualUnlock(
      resolveAfterThemeOrWorkNode(stateAfterThemeNode),
      pendingWorkResult ? buildWorkVisualUnlock(stateAfterThemeNode, pendingWorkResult) : null,
    );
    title = getPhaseLabel(nextState.phase);
    message = nextState.phase === 'election'
      ? '年度主题节点已经记录，接下来进入总选 / 年度人气结算。'
      : nextState.phase === 'b50'
        ? '年度作品节点已经记录，接下来进入 B50 / 舞台记忆结算。'
        : nextState.phase === 'yearSummary'
          ? '年度作品节点已经记录，接下来整理这一年的总结。'
          : '年度节点已经记录，新的月份准备开始。';
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
  const option = findMonthlyActionOption(state, plan.id);
  const variantText = option?.variantText ?? rollActionVariant(plan);
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
    actionPoolId: plan.actionPoolId,
    planName: plan.name,
    actionVisualKey: plan.actionVisualKey,
    variantText,
    feedbackText: plan.feedbackText,
    effects: actualEffects,
    postActionSummary: buildPostActionSummary(afterDeltas),
  };
  const growthLog = createGrowthLog(
    state,
    `${plan.name}：${variantText}`,
    `${variantText}。${plan.feedbackText}`,
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
      message: `${variantText}。${plan.feedbackText}`,
      visual: {
        type: 'actionVisual',
        key: plan.actionVisualKey,
      },
      changes: collectChanges(before, nextState),
      details: [`本月行动：${variantText}`],
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
  const sourceActionId = getCurrentMonthPlanId(state);
  const eventEntry: EventHistoryEntry = {
    id: `event-${state.currentYear}-${state.currentMonth}`,
    year: state.year,
    currentYear: state.currentYear,
    currentMonth: state.currentMonth,
    eventId: event.id,
    eventType: event.type,
    eventTitle: event.title,
    choiceId: choice.id,
    choiceLabel: choice.label,
    resultText: choice.resultText,
    eventCgKey: event.eventCgKey,
    galleryId: event.galleryId,
    effects: choice.effects,
    b50Bonus: choice.b50Bonus ?? 0,
    electionBonus: choice.electionBonus ?? 0,
    sourceActionId,
  };
  const growthLog = createGrowthLog(state, event.title, choice.resultText, choice.effects);
  const stateWithEvent = clampGameState({
    ...afterDeltas,
    pendingEventId: null,
    eventFlags: {
      ...afterDeltas.eventFlags,
      ...(choice.flags ?? {}),
    },
    eventCooldowns: {
      ...afterDeltas.eventCooldowns,
      [event.id]: getAbsoluteMonth(state.currentYear, state.currentMonth),
    },
    riskWarningCounts: updateRiskWarningCounts(afterDeltas.riskWarningCounts, event, choice),
    eventHistory: replaceSameMonthEvent(state.eventHistory, eventEntry),
    growthLogs: [...state.growthLogs, growthLog],
  });
  const stateWithVisualUnlock = applyVisualUnlock(
    stateWithEvent,
    buildEventVisualUnlock(stateWithEvent, event, choice),
  );
  const nextState = resolveAfterMonthActivity(stateWithVisualUnlock);

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

  const existingNodeResult = findNodeResult(state.b50Results, state.currentYear);
  const existingAnnualResult =
    findAnnualResult(state.annualResults, 'b50', state.currentYear) ??
    (existingNodeResult ? buildAnnualResultFromNode(state, existingNodeResult, 'b50') : null);

  if (existingAnnualResult) {
    const stateWithExistingResult = clampGameState({
      ...state,
      annualResults: replaceSameAnnualResult(state.annualResults, existingAnnualResult),
      milestones: mergeMilestones(state.milestones, buildMilestones(existingAnnualResult)),
    });
    const nextState = isYearEndMonth(stateWithExistingResult)
      ? buildYearSummaryState(stateWithExistingResult)
      : advanceToNextMonth(stateWithExistingResult);

    return {
      state: nextState,
      lastPlanId: null,
      lastResult: buildAnnualResultFeedback(existingAnnualResult, []),
      pendingEventId: null,
    };
  }

  const before = state;
  const result = calculateB50Result(state);
  const afterRewards = applyDeltas(state, result.rewards);
  const annualResult = buildAnnualResultFromNode(state, result, 'b50');
  const growthLog = createGrowthLog(state, 'B50 舞台记忆节点', result.message, result.rewards);
  const stateWithResult = clampGameState({
    ...afterRewards,
    b50Results: replaceSameYearNodeResult(state.b50Results, result),
    annualResults: replaceSameAnnualResult(state.annualResults, annualResult),
    milestones: mergeMilestones(state.milestones, buildMilestones(annualResult)),
    growthLogs: [...state.growthLogs, growthLog],
  });
  const nextState = isYearEndMonth(stateWithResult)
    ? buildYearSummaryState(stateWithResult)
    : advanceToNextMonth(stateWithResult);

  return {
    state: nextState,
    lastPlanId: null,
    lastResult: {
      title: annualResult.title,
      message: result.message,
      score: result.score,
      grade: result.grade,
      suppressFallbackVisual: true,
      changes: collectChanges(before, nextState),
      details: [`档位 ${annualResult.resultLabel}`],
    },
    pendingEventId: null,
  };
}

export function resolveElectionNode(state: GameState): GameSnapshot {
  if (state.phase !== 'election') {
    return makeNoopSnapshot(state, '当前阶段不能进行总选结算。');
  }

  const existingNodeResult = findNodeResult(state.electionResults, state.currentYear);
  const existingAnnualResult =
    findAnnualResult(state.annualResults, 'election', state.currentYear) ??
    (existingNodeResult ? buildAnnualResultFromNode(state, existingNodeResult, 'election') : null);

  if (existingAnnualResult) {
    const stateWithExistingResult = clampGameState({
      ...state,
      annualResults: replaceSameAnnualResult(state.annualResults, existingAnnualResult),
      milestones: mergeMilestones(state.milestones, buildMilestones(existingAnnualResult)),
    });
    const nextState = resolveAfterNode(stateWithExistingResult);

    return {
      state: nextState,
      lastPlanId: null,
      lastResult: buildAnnualResultFeedback(existingAnnualResult, []),
      pendingEventId: null,
    };
  }

  const before = state;
  const result = calculateElectionResult(state);
  const afterRewards = applyDeltas(state, result.rewards);
  const annualResult = buildAnnualResultFromNode(state, result, 'election');
  const growthLog = createGrowthLog(state, '年度人气总选节点', result.message, result.rewards);
  const stateWithResult = clampGameState({
    ...afterRewards,
    electionResults: replaceSameYearNodeResult(state.electionResults, result),
    annualResults: replaceSameAnnualResult(state.annualResults, annualResult),
    milestones: mergeMilestones(state.milestones, buildMilestones(annualResult)),
    growthLogs: [...state.growthLogs, growthLog],
  });
  const nextState = resolveAfterNode(stateWithResult);

  return {
    state: nextState,
    lastPlanId: null,
    lastResult: {
      title: annualResult.title,
      message: result.message,
      score: result.score,
      grade: result.grade,
      suppressFallbackVisual: true,
      changes: collectChanges(before, nextState),
      details: [`档位 ${annualResult.resultLabel}`],
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
    themeNode: '年度主题节点',
    workNode: '年度作品节点',
    yearSummary: '年度总结',
    flamePrelude: '终章占位',
    finalEnding: '终章结算',
  };

  return labels[phase];
}

export function getMonthLabel(state: GameState): string {
  return formatYearMonth(state.currentYear, state.currentMonth);
}

function resolveAfterMonthActivity(state: GameState): GameState {
  const themeNodeState = resolveThemeOrWorkNodeState(state);
  if (themeNodeState) {
    return themeNodeState;
  }

  if (shouldResolveElection(state)) {
    return clampGameState({
      ...state,
      phase: 'election',
    });
  }

  return resolveAfterNode(state);
}

function resolveAfterThemeOrWorkNode(state: GameState): GameState {
  if (shouldResolveElection(state)) {
    return clampGameState({
      ...state,
      phase: 'election',
    });
  }

  return resolveAfterNode(state);
}

function resolveThemeOrWorkNodeState(state: GameState): GameState | null {
  const config = getThemeNodeConfigForState(state);
  if (!config) {
    return null;
  }

  if (config.nodeType === 'performanceWork' && config.gradeEnabled) {
    const workResult = buildWorkResult(state, config);
    const afterDeltas = applyDeltas(state, workResult.deltas);
    const workMilestones = buildWorkMilestones(workResult, config);

    return clampGameState({
      ...afterDeltas,
      phase: 'workNode',
      workResults: replaceSameWorkResult(state.workResults, workResult),
      workMilestones: mergeWorkMilestones(state.workMilestones, workMilestones),
      pendingWorkResult: workResult,
      pendingThemeNodeResult: null,
    });
  }

  const themeNodeResult = buildThemeNodeResult(state, config);
  const afterDeltas = applyDeltas(state, themeNodeResult.deltas);

  return clampGameState({
    ...afterDeltas,
    phase: 'themeNode',
    themeNodeResults: replaceSameThemeNodeResult(state.themeNodeResults, themeNodeResult),
    pendingThemeNodeResult: themeNodeResult,
    pendingWorkResult: null,
  });
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
    !hasNodeResult(state.electionResults, state.currentYear) &&
    !hasAnnualResult(state.annualResults, 'election', state.currentYear)
  );
}

function shouldResolveB50(state: GameState): boolean {
  const calendar = getAnnualCalendar(state.currentYear);
  return (
    calendar.b50Month === state.currentMonth &&
    !hasNodeResult(state.b50Results, state.currentYear) &&
    !hasAnnualResult(state.annualResults, 'b50', state.currentYear)
  );
}

function hasNodeResult(history: { currentYear: number; year: number }[], currentYear: number): boolean {
  return history.some((item) => item.currentYear === currentYear);
}

function findNodeResult<T extends NodeResult>(history: T[], currentYear: number): T | null {
  return history.find((item) => item.currentYear === currentYear) ?? null;
}

function hasAnnualResult(
  history: AnnualResult[],
  type: AnnualResultType,
  currentYear: number,
): boolean {
  return history.some((item) => item.type === type && item.currentYear === currentYear);
}

function findAnnualResult(
  history: AnnualResult[],
  type: AnnualResultType,
  currentYear: number,
): AnnualResult | null {
  return history.find((item) => item.type === type && item.currentYear === currentYear) ?? null;
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
    monthlyActionOptions: [],
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
      Object.entries(normalizeDeltas(log.deltas)).forEach(([key, value]) => {
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
      label: STAT_CONFIG_BY_ID[key as StatKey].statName,
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
  if (state.pressure >= 70) {
    return '需要注意状态，小獭已经背着不少压力了。';
  }

  const routes = [
    { value: state.stagePower, text: '舞台实力派路线正在成形。' },
    { value: state.supportPower, text: '长期陪伴路线正在变得清晰。' },
    { value: state.influence, text: '影响力突破路线有明显机会。' },
    { value: state.operation, text: '可瓜可花的经营路线越来越鲜明。' },
  ];

  return routes.sort((a, b) => b.value - a.value)[0].text;
}

function applyDeltas(state: GameState, deltas: StatDeltas): GameState {
  const normalizedDeltas = normalizeDeltas(deltas);
  const changedValues = Object.entries(normalizedDeltas).reduce<Partial<GameState>>(
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

  return normalizeDeltas(keys.reduce<StatDeltas>((result, key) => {
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
  }, {}));
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

  STAT_CONFIGS.forEach((config) => {
    const rawValue = next[config.id];
    const value = Number.isFinite(rawValue) ? rawValue : config.initialValue;
    next[config.id] = clamp(Math.round(value), config.min, config.max);
  });

  next.workGrade = isValidWorkGrade(next.workGrade) ? next.workGrade : DEFAULT_WORK_GRADE;
  next.unlockedGallery = ensureBaseGallery(next.unlockedGallery);

  return next;
}

function collectChanges(before: GameState, after: GameState): StatChange[] {
  const keys = STAT_CONFIGS.map((config) => config.id);

  return keys
    .filter((key) => before[key] !== after[key])
    .map((key) => ({
      key,
      label: STAT_CONFIG_BY_ID[key].statName,
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
    deltas: normalizeDeltas(deltas),
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

function replaceSameThemeNodeResult(
  history: ThemeNodeResult[],
  entry: ThemeNodeResult,
): ThemeNodeResult[] {
  return [
    ...history.filter(
      (item) =>
        item.currentYear !== entry.currentYear ||
        item.month !== entry.month ||
        item.nodeId !== entry.nodeId,
    ),
    entry,
  ];
}

function replaceSameWorkResult(history: WorkResult[], entry: WorkResult): WorkResult[] {
  return [
    ...history.filter(
      (item) =>
        item.currentYear !== entry.currentYear ||
        item.month !== entry.month ||
        item.workId !== entry.workId,
    ),
    entry,
  ];
}

function mergeWorkMilestones(history: WorkMilestone[], entries: WorkMilestone[]): WorkMilestone[] {
  const next = new Map<string, WorkMilestone>();
  [...history, ...entries].forEach((entry) => {
    next.set(entry.id, entry);
  });

  return Array.from(next.values());
}

function replaceSameAnnualResult(history: AnnualResult[], entry: AnnualResult): AnnualResult[] {
  return [
    ...history.filter((item) => item.currentYear !== entry.currentYear || item.type !== entry.type),
    entry,
  ];
}

function mergeMilestones(history: Milestone[], entries: Milestone[]): Milestone[] {
  const next = new Map<string, Milestone>();
  [...history, ...entries].forEach((entry) => {
    next.set(entry.id, entry);
  });

  return Array.from(next.values());
}

function buildAnnualResultFromNode(
  state: GameState,
  result: NodeResult,
  type: AnnualResultType,
): AnnualResult {
  const title = type === 'election' ? '总选 / 年度人气' : 'B50 / 舞台记忆';
  const tier = result.tier ?? getFallbackNodeTier(type, result.grade);
  const resultLabel = result.rankLabel ?? result.gradeText;

  return {
    id: `annual-${type}-${state.currentYear}`,
    year: state.year,
    currentYear: state.currentYear,
    month: state.currentMonth,
    type,
    score: result.score,
    grade: result.grade,
    tier,
    expectedTier: result.expectedTier,
    title,
    resultLabel,
    narrative: result.message,
    deltas: normalizeDeltas(result.rewards),
    createdAtMonth: state.currentMonth,
    internalBreakdown: buildNodeDetails(result),
  };
}

function buildAnnualResultFeedback(
  result: AnnualResult,
  changes: StatChange[],
): GameFeedback {
  return {
    title: result.title,
    message: result.narrative,
    score: result.score,
    grade: result.grade,
    suppressFallbackVisual: true,
    changes,
    details: [`档位 ${result.resultLabel}`],
  };
}

function buildMilestones(result: AnnualResult): Milestone[] {
  if (result.type === 'election') {
    return buildElectionMilestones(result);
  }

  return buildB50Milestones(result);
}

function buildElectionMilestones(result: AnnualResult): Milestone[] {
  const milestones: Milestone[] = [];
  const add = (suffix: string, title: string, description: string) => {
    milestones.push({
      id: `${suffix}_${result.currentYear}`,
      year: result.year,
      currentYear: result.currentYear,
      type: result.type,
      title,
      description,
      sourceResultId: result.id,
    });
  };

  if (isElectionAtLeast(result.tier, 'ranked')) {
    add('election_rank', `${result.currentYear} 总选入围`, '年度人气节点进入可见名单。');
  }

  if (isElectionAtLeast(result.tier, 'top16')) {
    add('election_top16', `${result.currentYear} 总选 Top16`, '粉丝支持进入核心档位。');
  }

  if (isElectionAtLeast(result.tier, 'kami7')) {
    add('election_kamig7', `${result.currentYear} 总选神七`, '年度人气走到真正高位。');
  }

  if (isElectionAtLeast(result.tier, 'top3')) {
    add('election_top3', `${result.currentYear} 总选 Top3`, '距离年度顶点只差一步。');
  }

  if (result.tier === 'center') {
    add('election_champion', `${result.currentYear} 总选第1`, '长期应援汇成最高处的名字。');
  }

  return milestones;
}

function buildB50Milestones(result: AnnualResult): Milestone[] {
  const milestones: Milestone[] = [];
  const add = (suffix: string, title: string, description: string) => {
    milestones.push({
      id: `${suffix}_${result.currentYear}`,
      year: result.year,
      currentYear: result.currentYear,
      type: result.type,
      title,
      description,
      sourceResultId: result.id,
    });
  };

  if (isB50AtLeast(result.tier, 'ranked')) {
    add('b50_rank', `${result.currentYear} B50 入围`, '这一年的舞台留下了可见回声。');
  }

  if (isB50AtLeast(result.tier, 'high')) {
    add('b50_top16', `${result.currentYear} B50 Top16`, '舞台记忆进入高位区域。');
  }

  if (isB50AtLeast(result.tier, 'highlight')) {
    add('b50_top3', `${result.currentYear} B50 Top3`, '年度舞台成为重要记忆点。');
  }

  if (result.tier === 'legend') {
    add('b50_highlight', `${result.currentYear} 年度舞台记忆`, '这一场舞台成为会被反复提起的高光。');
  }

  return milestones;
}

function getFallbackNodeTier(type: AnnualResultType, grade: NodeGrade): NodeTier {
  if (type === 'election') {
    const electionFallback: Record<NodeGrade, NodeTier> = {
      S: 'center',
      A: 'kami7',
      B: 'top16',
      C: 'top32',
      D: 'top48',
      E: 'outside',
    };

    return electionFallback[grade];
  }

  const b50Fallback: Record<NodeGrade, NodeTier> = {
    S: 'legend',
    A: 'highlight',
    B: 'high',
    C: 'middle',
    D: 'ranked',
    E: 'notRanked',
  };

  return b50Fallback[grade];
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

function buildPostActionSummary(state: GameState) {
  return {
    stamina: state.stamina,
    mood: state.mood,
    pressure: state.pressure,
    fanCount: state.fanCount,
    supportPower: state.supportPower,
    influence: state.influence,
  };
}

function getCurrentMonthPlanId(state: GameState): PlanId | undefined {
  return state.planHistory.find(
    (entry) =>
      entry.currentYear === state.currentYear && entry.currentMonth === state.currentMonth,
  )?.planId;
}

function getAbsoluteMonth(currentYear: number, currentMonth: number): number {
  return (currentYear - CAREER_START_YEAR) * MONTHS_PER_YEAR + currentMonth;
}

function updateRiskWarningCounts(
  counts: Record<string, number>,
  event: RandomEventConfig,
  choice: RandomEventChoice,
): Record<string, number> {
  const next = { ...counts };

  if (event.type === 'recovery') {
    Object.keys(next).forEach((key) => {
      next[key] = Math.max(0, next[key] - 1);
    });
    return next;
  }

  if (event.type !== 'risk') {
    return next;
  }

  const riskKey = event.riskKey ?? event.id;
  if (choice.riskLevel === 'major') {
    next[riskKey] = (next[riskKey] ?? 0) + 2;
  } else if (choice.riskLevel === 'warning') {
    next[riskKey] = (next[riskKey] ?? 0) + 1;
  } else {
    next[riskKey] = Math.max(0, (next[riskKey] ?? 0) - 1);
  }

  return next;
}

function buildMigratedStats(
  source: Record<string, unknown> | null | undefined,
  initial: GameState,
): Pick<GameState, StatKey> {
  return STAT_CONFIGS.reduce<Pick<GameState, StatKey>>((result, config) => {
    result[config.id] = readMigratedNumber(source, config.id, initial[config.id]);
    return result;
  }, {} as Pick<GameState, StatKey>);
}

function readMigratedNumber(
  source: Record<string, unknown> | null | undefined,
  statKey: StatKey,
  fallback: number,
): number {
  const candidateKeys = [
    statKey,
    ...Object.entries(LEGACY_STAT_KEY_MAP)
      .filter(([, currentKey]) => currentKey === statKey)
      .map(([legacyKey]) => legacyKey),
  ];

  for (const key of candidateKeys) {
    const value = source?.[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }

  return fallback;
}

function normalizeFeedback(feedback: GameFeedback): GameFeedback {
  return {
    ...feedback,
    changes: normalizeStatChanges(feedback.changes ?? []),
  };
}

function normalizeStatChanges(changes: StatChange[]): StatChange[] {
  return changes
    .map((change) => {
      const statKey = toCurrentStatKey(String(change.key));
      if (!statKey) {
        return null;
      }

      return {
        ...change,
        key: statKey,
        label: STAT_CONFIG_BY_ID[statKey].statName,
      };
    })
    .filter((change): change is StatChange => change !== null);
}

function normalizeDeltas(deltas: Partial<Record<string, number>> | null | undefined): StatDeltas {
  return Object.entries(deltas ?? {}).reduce<StatDeltas>((result, [key, value]) => {
    if (value === undefined || !Number.isFinite(value)) {
      return result;
    }

    const statKey = toCurrentStatKey(key);
    if (!statKey) {
      return result;
    }

    result[statKey] = (result[statKey] ?? 0) + value;
    return result;
  }, {});
}

function normalizeNumberRecord(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce<Record<string, number>>((result, [key, rawValue]) => {
    if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
      result[key] = Math.max(0, Math.round(rawValue));
    }

    return result;
  }, {});
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
    phase === 'themeNode' ||
    phase === 'workNode' ||
    phase === 'election' ||
    phase === 'b50' ||
    phase === 'yearSummary' ||
    phase === 'flamePrelude' ||
    phase === 'finalEnding'
  ) {
    if (phase === 'finalEnding') {
      return 'flamePrelude';
    }

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
    const plan = PLAN_BY_ID[entry.planId];

    return {
      ...entry,
      currentYear,
      currentMonth,
      actionPoolId: entry.actionPoolId ?? plan?.actionPoolId,
      actionVisualKey: entry.actionVisualKey ?? plan?.actionVisualKey,
      variantText: entry.variantText ?? plan?.name,
      effects: normalizeDeltas(entry.effects),
    };
  });
}

function normalizeMonthlyActionOptions(options: MonthlyActionOption[]): MonthlyActionOption[] {
  return options
    .map((option) => {
      const plan = PLAN_BY_ID[option.planId];
      if (!plan?.actionPoolId) {
        return null;
      }

      return {
        ...option,
        year: option.year ?? getCareerYear(option.currentYear),
        currentYear: option.currentYear,
        currentMonth: option.currentMonth,
        actionPoolId: option.actionPoolId ?? plan.actionPoolId,
        variantText: option.variantText || plan.name,
      };
    })
    .filter((option): option is MonthlyActionOption => option !== null);
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
      eventType: entry.eventType ?? event?.type,
      eventCgKey: entry.eventCgKey ?? event?.eventCgKey,
      galleryId: entry.galleryId ?? event?.galleryId,
      effects: normalizeDeltas(entry.effects),
      sourceActionId: entry.sourceActionId,
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
    ...(('rewards' in entry && entry.rewards)
      ? { rewards: normalizeDeltas(entry.rewards as StatDeltas) }
      : {}),
  }));
}

function normalizeAnnualResults(history: Partial<AnnualResult>[]): AnnualResult[] {
  if (!Array.isArray(history)) {
    return [];
  }

  return history.map((entry, index) => {
    const type: AnnualResultType = entry.type === 'b50' ? 'b50' : 'election';
    const currentYear = entry.currentYear ?? CAREER_START_YEAR + clamp(Math.round(entry.year ?? 1), 1, 11) - 1;
    const calendar = getAnnualCalendar(currentYear);
    const defaultMonth = type === 'election' ? calendar.electionMonth : calendar.b50Month;
    const month = clamp(Math.round(entry.month ?? entry.createdAtMonth ?? defaultMonth ?? 1), 1, MONTHS_PER_YEAR);
    const grade = isNodeGrade(entry.grade) ? entry.grade : 'E';
    const tier = normalizeAnnualTier(type, entry.tier, grade);
    const expectedTier = normalizeOptionalAnnualTier(type, entry.expectedTier);
    const title = entry.title || (type === 'election' ? '总选 / 年度人气' : 'B50 / 舞台记忆');
    const resultLabel = entry.resultLabel || entry.title || String(tier);

    return {
      id: entry.id || `annual-${type}-${currentYear}-${index + 1}`,
      year: getCareerYear(currentYear),
      currentYear,
      month,
      type,
      score: Number.isFinite(entry.score) ? Math.round(Number(entry.score)) : 0,
      grade,
      tier,
      expectedTier,
      title,
      resultLabel,
      narrative: entry.narrative || '',
      deltas: normalizeDeltas(entry.deltas),
      createdAtMonth: clamp(Math.round(entry.createdAtMonth ?? month), 1, MONTHS_PER_YEAR),
      internalBreakdown: Array.isArray(entry.internalBreakdown)
        ? entry.internalBreakdown.filter((item): item is string => typeof item === 'string')
        : [],
    };
  });
}

function normalizeMilestones(history: Partial<Milestone>[]): Milestone[] {
  if (!Array.isArray(history)) {
    return [];
  }

  return history.map((entry, index) => {
    const type: AnnualResultType = entry.type === 'b50' ? 'b50' : 'election';
    const currentYear = entry.currentYear ?? CAREER_START_YEAR + clamp(Math.round(entry.year ?? 1), 1, 11) - 1;

    return {
      id: entry.id || `milestone-${type}-${currentYear}-${index + 1}`,
      year: getCareerYear(currentYear),
      currentYear,
      type,
      title: entry.title || '年度节点记录',
      description: entry.description || '',
      sourceResultId: entry.sourceResultId || `annual-${type}-${currentYear}`,
    };
  });
}

function normalizeThemeNodeResults(history: Partial<ThemeNodeResult>[]): ThemeNodeResult[] {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .map(normalizeNullableThemeNodeResult)
    .filter((entry): entry is ThemeNodeResult => entry !== null);
}

function normalizeWorkResults(history: Partial<WorkResult>[]): WorkResult[] {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .map(normalizeNullableWorkResult)
    .filter((entry): entry is WorkResult => entry !== null);
}

function normalizeWorkMilestones(history: Partial<WorkMilestone>[]): WorkMilestone[] {
  if (!Array.isArray(history)) {
    return [];
  }

  return history.map((entry, index) => {
    const currentYear = entry.currentYear ?? CAREER_START_YEAR + clamp(Math.round(entry.year ?? 1), 1, 11) - 1;
    const grade = isValidWorkGrade(entry.grade) ? entry.grade : DEFAULT_WORK_GRADE;

    return {
      id: entry.id || `work-milestone-${currentYear}-${index + 1}`,
      year: getCareerYear(currentYear),
      currentYear,
      type: 'work',
      title: entry.title || '作品里程碑',
      description: entry.description || '',
      sourceWorkResultId: entry.sourceWorkResultId || '',
      grade,
      potentialVisualKey: isValidWorkCgKey(entry.potentialVisualKey) ? entry.potentialVisualKey : undefined,
    };
  });
}

function normalizeNullableThemeNodeResult(
  entry: Partial<ThemeNodeResult> | null | undefined,
): ThemeNodeResult | null {
  if (!entry) {
    return null;
  }

  const currentYear = entry.currentYear ?? CAREER_START_YEAR + clamp(Math.round(entry.year ?? 1), 1, 11) - 1;
  const month = clamp(Math.round(entry.month ?? entry.createdAtMonth ?? 1), 1, MONTHS_PER_YEAR);

  return {
    id: entry.id || `theme-${entry.nodeId ?? 'unknown'}-${currentYear}`,
    year: getCareerYear(currentYear),
    currentYear,
    month,
    nodeId: entry.nodeId || 'unknown',
    title: entry.title || '年度主题节点',
    nodeType: 'timeline',
    narrative: entry.narrative || '',
    deltas: normalizeDeltas(entry.deltas),
    sourceName: entry.sourceName,
    createdAtMonth: clamp(Math.round(entry.createdAtMonth ?? month), 1, MONTHS_PER_YEAR),
    potentialVisualKey: isValidGalleryId(entry.potentialVisualKey) ? entry.potentialVisualKey : undefined,
  };
}

function normalizeNullableWorkResult(entry: Partial<WorkResult> | null | undefined): WorkResult | null {
  if (!entry) {
    return null;
  }

  const currentYear = entry.currentYear ?? CAREER_START_YEAR + clamp(Math.round(entry.year ?? 1), 1, 11) - 1;
  const month = clamp(Math.round(entry.month ?? entry.createdAtMonth ?? 1), 1, MONTHS_PER_YEAR);
  const grade = isValidWorkGrade(entry.grade) ? entry.grade : DEFAULT_WORK_GRADE;
  const workId = isValidWorkCgKey(entry.workId) ? entry.workId : 'girls_revolution';

  return {
    id: entry.id || `work-${workId}-${currentYear}`,
    year: getCareerYear(currentYear),
    currentYear,
    month,
    workId,
    title: entry.title || '年度作品节点',
    theme: entry.theme || '',
    score: Number.isFinite(entry.score) ? Math.round(Number(entry.score)) : 0,
    grade,
    resultLabel: entry.resultLabel || grade,
    narrative: entry.narrative || '',
    deltas: normalizeDeltas(entry.deltas),
    relatedAnnualResultIds: Array.isArray(entry.relatedAnnualResultIds)
      ? entry.relatedAnnualResultIds.filter((item): item is string => typeof item === 'string')
      : [],
    relatedEventIds: Array.isArray(entry.relatedEventIds)
      ? entry.relatedEventIds.filter((item): item is string => typeof item === 'string')
      : [],
    relatedActionSummary: normalizeNumberRecord(entry.relatedActionSummary),
    potentialVisualKey: isValidWorkCgKey(entry.potentialVisualKey) ? entry.potentialVisualKey : undefined,
    createdAtMonth: clamp(Math.round(entry.createdAtMonth ?? month), 1, MONTHS_PER_YEAR),
  };
}

function normalizeGalleryUnlockHistory(history: Partial<GalleryUnlockRecord>[]): GalleryUnlockRecord[] {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((entry) => isValidGalleryId(entry.galleryId))
    .map((entry, index) => {
      const currentYear =
        entry.currentYear ?? CAREER_START_YEAR + clamp(Math.round(entry.year ?? 1), 1, 11) - 1;
      const month = clamp(Math.round(entry.month ?? entry.unlockedAtMonth ?? 1), 1, MONTHS_PER_YEAR);
      const sourceType = normalizeGallerySourceType(entry.sourceType);

      return {
        id: entry.id || `gallery-${entry.galleryId}-${currentYear}-${month}-${index + 1}`,
        galleryId: entry.galleryId as GalleryId,
        sourceType,
        sourceId: entry.sourceId || String(entry.galleryId),
        year: getCareerYear(currentYear),
        currentYear,
        month,
        title: entry.title || '视觉记忆',
        unlockedAtMonth: clamp(Math.round(entry.unlockedAtMonth ?? month), 1, MONTHS_PER_YEAR),
        grade: isValidWorkGrade(entry.grade) ? entry.grade : undefined,
        eventChoiceId: typeof entry.eventChoiceId === 'string' ? entry.eventChoiceId : undefined,
      };
    });
}

function normalizeNullableVisualUnlock(
  entry: Partial<VisualUnlock> | null | undefined,
): VisualUnlock | null {
  if (!entry || !isValidGalleryId(entry.galleryId)) {
    return null;
  }

  const currentYear = entry.currentYear ?? CAREER_START_YEAR + clamp(Math.round(entry.year ?? 1), 1, 11) - 1;
  const month = clamp(Math.round(entry.month ?? entry.unlockedAtMonth ?? 1), 1, MONTHS_PER_YEAR);

  return {
    id: entry.id || `visual-${entry.galleryId}-${currentYear}-${month}`,
    galleryId: entry.galleryId as GalleryId,
    sourceType: normalizeGallerySourceType(entry.sourceType),
    sourceId: entry.sourceId || String(entry.galleryId),
    year: getCareerYear(currentYear),
    currentYear,
    month,
    title: entry.title || '视觉记忆',
    description: entry.description || '这份记忆已经加入图鉴。',
    imagePath: typeof entry.imagePath === 'string' ? entry.imagePath : '',
    unlockedAtMonth: clamp(Math.round(entry.unlockedAtMonth ?? month), 1, MONTHS_PER_YEAR),
    grade: isValidWorkGrade(entry.grade) ? entry.grade : undefined,
    eventChoiceId: typeof entry.eventChoiceId === 'string' ? entry.eventChoiceId : undefined,
  };
}

function normalizeYearSummaries(history: YearSummary[]): YearSummary[] {
  return history.map((entry) => ({
    ...entry,
    currentYear: entry.currentYear ?? CAREER_START_YEAR + clamp(Math.round(entry.year ?? 1), 1, 11) - 1,
    planNames: entry.planNames ?? [],
    growthSummary: normalizeStatChanges(entry.growthSummary ?? []),
  }));
}

function normalizeGrowthLogs(history: GrowthLog[]): GrowthLog[] {
  return history.map((entry) => ({
    ...entry,
    currentYear: entry.currentYear ?? CAREER_START_YEAR + clamp(Math.round(entry.year ?? 1), 1, 11) - 1,
    currentMonth: entry.currentMonth ?? 1,
    phase: normalizePhase((entry as { phase?: string }).phase),
    deltas: normalizeDeltas(entry.deltas),
  }));
}

function getEventConfig(eventId: string) {
  if (eventId === FALLBACK_EVENT.id) {
    return FALLBACK_EVENT;
  }

  return RANDOM_EVENTS.find((event) => event.id === eventId);
}

function buildEventVisualUnlock(
  state: GameState,
  event: RandomEventConfig,
  choice: RandomEventChoice,
): VisualUnlock | null {
  const galleryId = event.galleryId;
  const visualKey = event.eventCgKey ?? event.visualKey;
  if (!galleryId || !visualKey || galleryId !== visualKey || hasVisualUnlocked(state, galleryId)) {
    return null;
  }

  return createVisualUnlock({
    state,
    galleryId,
    sourceType: 'event',
    sourceId: event.id,
    title: event.title,
    description: choice.resultText,
    eventChoiceId: choice.id,
  });
}

function buildWorkVisualUnlock(state: GameState, result: WorkResult): VisualUnlock | null {
  if ((result.grade !== 'A' && result.grade !== 'S') || !result.potentialVisualKey) {
    return null;
  }

  if (hasVisualUnlocked(state, result.potentialVisualKey)) {
    return null;
  }

  return createVisualUnlock({
    state,
    galleryId: result.potentialVisualKey,
    sourceType: 'work',
    sourceId: result.workId,
    title: result.title,
    description: result.grade === 'S'
      ? '年度级高光已经收录进作品记忆。'
      : '代表作记忆已经收录进作品图鉴。',
    grade: result.grade,
  });
}

function createVisualUnlock({
  state,
  galleryId,
  sourceType,
  sourceId,
  title,
  description,
  grade,
  eventChoiceId,
}: {
  state: GameState;
  galleryId: GalleryId;
  sourceType: GallerySourceType;
  sourceId: string;
  title: string;
  description: string;
  grade?: WorkResult['grade'];
  eventChoiceId?: string;
}): VisualUnlock {
  const item = GALLERY_ITEMS.find((entry) => entry.id === galleryId);
  const image = item ? getVisualAsset(item.visual.type, item.visual.key) : null;

  return {
    id: `visual-${galleryId}-${state.currentYear}-${state.currentMonth}`,
    galleryId,
    sourceType,
    sourceId,
    year: state.year,
    currentYear: state.currentYear,
    month: state.currentMonth,
    title: item?.name ?? title,
    description: item?.description ?? description,
    imagePath: image?.plannedSrc ?? image?.src ?? '',
    unlockedAtMonth: state.currentMonth,
    grade,
    eventChoiceId,
  };
}

function applyVisualUnlock(state: GameState, unlock: VisualUnlock | null): GameState {
  if (!unlock || hasVisualUnlocked(state, unlock.galleryId)) {
    return state;
  }

  const record: GalleryUnlockRecord = {
    id: `gallery-${unlock.galleryId}-${unlock.currentYear}-${unlock.month}`,
    galleryId: unlock.galleryId,
    sourceType: unlock.sourceType,
    sourceId: unlock.sourceId,
    year: unlock.year,
    currentYear: unlock.currentYear,
    month: unlock.month,
    title: unlock.title,
    unlockedAtMonth: unlock.unlockedAtMonth,
    grade: unlock.grade,
    eventChoiceId: unlock.eventChoiceId,
  };

  return clampGameState({
    ...state,
    unlockedGallery: addGalleryId(state.unlockedGallery, unlock.galleryId),
    unlockedGalleryIds: addGalleryId(state.unlockedGalleryIds, unlock.galleryId).filter(
      (id) => id !== 'base',
    ),
    galleryUnlockHistory: mergeGalleryUnlockHistory(state.galleryUnlockHistory, record),
    pendingVisualUnlock: unlock,
  });
}

function consumePendingVisualUnlock(state: GameState): GameState {
  const pendingId = state.pendingVisualUnlock?.galleryId;

  return clampGameState({
    ...state,
    pendingVisualUnlock: null,
    seenVisualUnlockIds: pendingId
      ? normalizeGalleryIds([...state.seenVisualUnlockIds, pendingId])
      : state.seenVisualUnlockIds,
  });
}

function hasVisualUnlocked(state: GameState, galleryId: GalleryId): boolean {
  return (
    state.unlockedGallery.includes(galleryId) ||
    state.unlockedGalleryIds.includes(galleryId) ||
    state.galleryUnlockHistory.some((entry) => entry.galleryId === galleryId)
  );
}

function mergeGalleryUnlockHistory(
  history: GalleryUnlockRecord[],
  record: GalleryUnlockRecord,
): GalleryUnlockRecord[] {
  if (history.some((entry) => entry.galleryId === record.galleryId)) {
    return history;
  }

  return [...history, record];
}

function addGalleryId(ids: GalleryId[], id: GalleryId): GalleryId[] {
  return Array.from(new Set<GalleryId>(['base', ...ids, id]));
}

function ensureBaseGallery(ids: GalleryId[]): GalleryId[] {
  return Array.from(new Set<GalleryId>(['base', ...ids]));
}

const WORK_CG_KEYS = new Set<WorkCgKey>([
  'girls_revolution',
  'yy_ds',
  'xiaoyi',
  'meteor_stream',
  'triones',
  'fu',
  'super_tata',
  'brand_mark',
  'flame',
]);

function isValidWorkCgKey(value: unknown): value is WorkCgKey {
  return typeof value === 'string' && WORK_CG_KEYS.has(value as WorkCgKey);
}

function isValidGalleryId(value: unknown): value is GalleryId {
  return (
    typeof value === 'string' &&
    GALLERY_ITEMS.some((item) => item.id === value)
  );
}

function normalizeGalleryIds(value: unknown): GalleryId[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(value.filter((item): item is GalleryId => isValidGalleryId(item))),
  );
}

function normalizeGallerySourceType(value: unknown): GallerySourceType {
  return value === 'work' || value === 'annual' || value === 'ending' ? value : 'event';
}

function isNodeGrade(value: unknown): value is NodeGrade {
  return value === 'S' || value === 'A' || value === 'B' || value === 'C' || value === 'D' || value === 'E';
}

function normalizeAnnualTier(
  type: AnnualResultType,
  value: unknown,
  grade: NodeGrade,
): NodeTier {
  const candidate = String(value);
  if (type === 'election' && isElectionAtLeast(candidate, 'outside')) {
    return candidate as NodeTier;
  }

  if (type === 'b50' && isB50AtLeast(candidate, 'notRanked')) {
    return candidate as NodeTier;
  }

  return getFallbackNodeTier(type, grade);
}

function normalizeOptionalAnnualTier(
  type: AnnualResultType,
  value: unknown,
): NodeTier | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const candidate = String(value);
  if (type === 'election' && isElectionAtLeast(candidate, 'outside')) {
    return candidate as NodeTier;
  }

  if (type === 'b50' && isB50AtLeast(candidate, 'notRanked')) {
    return candidate as NodeTier;
  }

  return undefined;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
