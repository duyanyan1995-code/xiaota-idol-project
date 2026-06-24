import { getAnnualCalendar } from '../config/annualCalendar';
import { PLAN_BY_ID, PLANS } from '../config/plans';
import type { GameSnapshot, GameState, PlanId, RandomEventConfig, StatChange, StatKey } from '../types/game';
import type { MonthlySummaryData } from '../types/flow';
import {
  advancePhase,
  applyPlan,
  isEventPhase,
  resolveNoEventAfterPlan,
} from './gameLogic';
import { getCurrentMonthlyActionOptions } from './actionRoll';
import { pickMonthlyEvent } from './eventLogic';
import { getCriticalGameStateReason, getEventPauseReason } from './flowImportance';
import { getTopRoutes } from './routeLogic';
import { getStatLabel } from './statDisplay';
import { getPlanAvailability, isPlanUnlocked } from './unlockLogic';

interface AutoAdvanceAccumulator {
  monthCount: number;
  actions: Map<string, number>;
  events: Map<string, number>;
  changes: StatChange[];
}

export interface AutoAdvanceResult {
  snapshot: GameSnapshot;
  pendingEvent: RandomEventConfig | null;
  summary: MonthlySummaryData;
}

export interface AutoAdvanceStepSummary {
  currentYear: number;
  currentMonth: number;
  actionFeedback: GameSnapshot['lastResult'];
  eventFeedback?: GameSnapshot['lastResult'];
  noEventText?: string;
  changes: StatChange[];
  actionLabel?: string;
  eventLabel?: string;
  completedMonth: boolean;
  importantEvent?: Pick<RandomEventConfig, 'id' | 'title' | 'description'> | null;
}

export interface AutoAdvanceStepResult {
  type: 'advanced' | 'stopped';
  snapshot: GameSnapshot;
  pendingEvent: RandomEventConfig | null;
  step?: AutoAdvanceStepSummary;
  stopReason?: string;
}

const MAX_AUTO_STEPS = 80;

export function runAutoAdvance(initialState: GameState): AutoAdvanceResult {
  const accumulator: AutoAdvanceAccumulator = {
    monthCount: 0,
    actions: new Map(),
    events: new Map(),
    changes: [],
  };
  let currentState = initialState;
  let lastSnapshot: GameSnapshot = {
    state: currentState,
    lastPlanId: null,
    lastResult: null,
    pendingEventId: null,
  };
  let pendingEvent: RandomEventConfig | null = null;
  let stopReason: string | null = null;

  for (let step = 0; step < MAX_AUTO_STEPS; step += 1) {
    const result = runAutoAdvanceStep(currentState);
    lastSnapshot = result.snapshot;
    currentState = result.snapshot.state;
    pendingEvent = result.pendingEvent;

    if (result.step?.actionLabel) {
      addCount(accumulator.actions, result.step.actionLabel);
    }

    if (result.step?.eventLabel) {
      addCount(accumulator.events, result.step.eventLabel);
    }

    if (result.step?.completedMonth || (result.type === 'stopped' && result.step?.actionLabel)) {
      accumulator.monthCount += 1;
    }

    accumulator.changes = mergeStatChanges(accumulator.changes, result.step?.changes);

    if (result.type === 'stopped') {
      stopReason = result.stopReason ?? '当前阶段需要手动处理';
      break;
    }
  }

  if (!stopReason) {
    stopReason = '已达到自动推进安全上限';
  }

  return {
    snapshot: {
      ...lastSnapshot,
      state: currentState,
      pendingEventId: pendingEvent?.id ?? null,
    },
    pendingEvent,
    summary: {
      kind: 'auto',
      title: '自动推进摘要',
      subtitle: `推进了 ${accumulator.monthCount} 个月`,
      monthCount: accumulator.monthCount,
      actionCounts: toCountItems(accumulator.actions),
      eventCounts: toCountItems(accumulator.events),
      changes: accumulator.changes,
      stopReason,
      importantEvent: pendingEvent
        ? {
            id: pendingEvent.id,
            title: pendingEvent.title,
            description: pendingEvent.description,
          }
        : null,
    },
  };
}

export function runAutoAdvanceStep(initialState: GameState): AutoAdvanceStepResult {
  const immediateStopReason = getAutoAdvanceStopReason(initialState);
  if (immediateStopReason) {
    return {
      type: 'stopped',
      snapshot: {
        state: initialState,
        lastPlanId: null,
        lastResult: null,
        pendingEventId: null,
      },
      pendingEvent: null,
      stopReason: immediateStopReason,
    };
  }

  let workingSnapshot: GameSnapshot = {
    state: initialState,
    lastPlanId: null,
    lastResult: null,
    pendingEventId: null,
  };
  let workingState = initialState;

  if (workingState.phase === 'monthStart') {
    workingSnapshot = advancePhase(workingState);
    workingState = workingSnapshot.state;
  }

  const stopAfterAdvance = getAutoAdvanceStopReason(workingState);
  if (stopAfterAdvance) {
    return {
      type: 'stopped',
      snapshot: workingSnapshot,
      pendingEvent: null,
      stopReason: stopAfterAdvance,
    };
  }

  if (workingState.phase !== 'monthlyPlan') {
    return {
      type: 'stopped',
      snapshot: workingSnapshot,
      pendingEvent: null,
      stopReason: getAutoAdvanceStopReason(workingState) ?? '当前阶段需要手动处理',
    };
  }

  const actionYear = workingState.currentYear;
  const actionMonth = workingState.currentMonth;
  const beforeSpecialActions = getUnlockedSpecialActionIds(workingState);
  const planId = chooseAutoAdvancePlan(workingState);
  const planSnapshot = applyPlan(workingState, planId);
  const planFeedback = planSnapshot.lastResult;
  const actionLabel = PLAN_BY_ID[planId]?.name ?? planId;
  workingState = planSnapshot.state;
  workingSnapshot = planSnapshot;

  if (!isEventPhase(workingState.phase)) {
    const changes = planFeedback?.changes ?? [];
    return {
      type: 'advanced',
      snapshot: workingSnapshot,
      pendingEvent: null,
      step: {
        currentYear: actionYear,
        currentMonth: actionMonth,
        actionFeedback: planFeedback,
        changes,
        actionLabel,
        completedMonth: true,
      },
    };
  }

  const eventPick = pickMonthlyEvent(workingState);
  if (eventPick.type === 'event') {
    const changes = planFeedback?.changes ?? [];

    return {
      type: 'stopped',
      snapshot: {
        ...workingSnapshot,
        pendingEventId: eventPick.event.id,
      },
      pendingEvent: eventPick.event,
      stopReason: getEventPauseReason(eventPick.event, workingState),
      step: {
        currentYear: actionYear,
        currentMonth: actionMonth,
        actionFeedback: planFeedback,
        changes,
        actionLabel,
        completedMonth: false,
        importantEvent: {
          id: eventPick.event.id,
          title: eventPick.event.title,
          description: eventPick.event.description,
        },
      },
    };
  }

  const noEventSnapshot = resolveNoEventAfterPlan(workingState);
  workingSnapshot = {
    ...noEventSnapshot,
    lastPlanId: planSnapshot.lastPlanId,
    lastResult: planSnapshot.lastResult,
  };
  workingState = workingSnapshot.state;

  const changes = mergeStatChanges(planFeedback?.changes, undefined);
  const unlockedSpecialAction = findNewSpecialAction(beforeSpecialActions, workingState);
  const stopReason =
    unlockedSpecialAction ??
    getCriticalGameStateReason(workingState) ??
    getAutoAdvanceStopReason(workingState);

  return {
    type: stopReason ? 'stopped' : 'advanced',
    snapshot: workingSnapshot,
    pendingEvent: null,
    stopReason: stopReason ?? undefined,
    step: {
      currentYear: actionYear,
      currentMonth: actionMonth,
      actionFeedback: planFeedback,
      eventFeedback: null,
      noEventText: '这个月平稳度过。',
      changes,
      actionLabel,
      eventLabel: '平稳度过',
      completedMonth: true,
    },
  };
}

export function chooseAutoAdvancePlan(state: GameState): PlanId {
  const calendar = getAnnualCalendar(state.currentYear);
  const monthsUntilElection = getMonthsUntil(state.currentMonth, calendar.electionMonth);
  const monthsUntilB50 = getMonthsUntil(state.currentMonth, calendar.b50Month);
  const topRoute = getTopRoutes(state, 1)[0]?.id;
  const monthlyOptions = getCurrentMonthlyActionOptions(state).filter((option) => {
    const plan = PLAN_BY_ID[option.planId];
    return plan && isPlanUnlocked(plan, state);
  });
  const monthlyPlanIds = monthlyOptions.map((option) => option.planId);
  const candidates: PlanId[] = [];

  if (state.stamina <= 35 || state.pressure >= 70) {
    candidates.push('restAndReflect', 'stableOperation', 'restAndReflect');
  }

  if (monthsUntilElection <= 2) {
    candidates.push('fanService', 'outsideExposure', 'imageBuilding');
  }

  if (monthsUntilB50 <= 2) {
    candidates.push('stageFocus', 'theaterTraining');
  }

  if (topRoute === 'stage') {
    candidates.push('stageFocus', 'theaterTraining');
  } else if (topRoute === 'fan') {
    candidates.push('fanService', 'stableOperation');
  } else if (topRoute === 'outside') {
    candidates.push('outsideExposure', 'imageBuilding');
  } else if (topRoute === 'style') {
    candidates.push('imageBuilding', 'outsideExposure');
  }

  candidates.push('stableOperation', 'theaterTraining', 'fanService');

  const candidateFromMonthlyOptions = candidates.filter((planId) => monthlyPlanIds.includes(planId));
  if (candidateFromMonthlyOptions.length > 0) {
    return candidateFromMonthlyOptions[Math.floor(Math.random() * candidateFromMonthlyOptions.length)];
  }

  if (monthlyOptions.length > 0) {
    return monthlyOptions[Math.floor(Math.random() * monthlyOptions.length)].planId;
  }

  return pickAvailablePlan(state, candidates);
}

export function mergeStatChanges(
  current: StatChange[] | null | undefined,
  next: StatChange[] | null | undefined,
): StatChange[] {
  const totals = new Map<StatKey, number>();

  [...(current ?? []), ...(next ?? [])].forEach((change) => {
    if (change.delta === 0) {
      return;
    }

    totals.set(change.key, (totals.get(change.key) ?? 0) + change.delta);
  });

  return Array.from(totals.entries())
    .map(([key, delta]) => ({
      key,
      label: getStatLabel(key),
      before: 0,
      after: delta,
      delta,
    }))
    .filter((change) => change.delta !== 0);
}

export function getAutoAdvanceStopReason(state: GameState): string | null {
  if (state.pendingVisualUnlock) {
    return '视觉记忆解锁';
  }

  if (state.phase === 'flamePrelude') {
    return '2026 FLAME 终章开启';
  }

  if (state.phase === 'finalEnding') {
    return '进入终章结算';
  }

  if (state.isGameCompleted) {
    return 'V4 通关完成';
  }

  if (state.phase === 'yearSummary') {
    return '年度总结';
  }

  if (state.phase === 'themeNode') {
    return '年度主题节点';
  }

  if (state.phase === 'workNode') {
    return '年度作品节点';
  }

  if (state.phase === 'election') {
    return '本月总选';
  }

  if (state.phase === 'finalElection') {
    return '最终总选';
  }

  if (state.phase === 'b50') {
    return '本月 B50';
  }

  if (state.phase === 'monthlyEvent') {
    return '本月事件待处理';
  }

  return getCriticalGameStateReason(state);
}

function getMonthsUntil(currentMonth: number, targetMonth: number | undefined): number {
  if (!targetMonth || targetMonth < currentMonth) {
    return Number.POSITIVE_INFINITY;
  }

  return targetMonth - currentMonth;
}

function pickAvailablePlan(state: GameState, candidates: PlanId[]): PlanId {
  const available = candidates.filter((planId) => {
    const plan = PLAN_BY_ID[planId];
    return plan && isPlanUnlocked(plan, state);
  });

  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }

  return PLANS.find((plan) => !plan.isSpecialAction && isPlanUnlocked(plan, state))?.id ?? 'stableOperation';
}

function getUnlockedSpecialActionIds(state: GameState): Set<PlanId> {
  return new Set(
    PLANS.filter((plan) => plan.isSpecialAction && getPlanAvailability(plan, state).unlocked).map(
      (plan) => plan.id,
    ),
  );
}

function findNewSpecialAction(before: Set<PlanId>, state: GameState): string | null {
  const unlocked = PLANS.find(
    (plan) => plan.isSpecialAction && getPlanAvailability(plan, state).unlocked && !before.has(plan.id),
  );

  return unlocked ? `特殊行动解锁：${unlocked.name}` : null;
}

function addCount(map: Map<string, number>, label: string): void {
  map.set(label, (map.get(label) ?? 0) + 1);
}

function toCountItems(map: Map<string, number>) {
  return Array.from(map.entries()).map(([label, count]) => ({
    label,
    count,
  }));
}
