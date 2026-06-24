import { PLAN_BY_ID, PLANS } from '../config/plans';
import type {
  ActionPoolId,
  GameState,
  MonthlyActionOption,
  PlanConfig,
  PlanId,
} from '../types/game';

export const MONTHLY_ACTION_OPTION_COUNT = 4;

type ActionStageId =
  | 'newcomer'
  | 'growth'
  | 'core'
  | 'certification'
  | 'sprint'
  | 'flameFinale';

type ActionWeightTable = Record<ActionPoolId, number>;

const ACTION_STAGE_WEIGHTS: Record<ActionStageId, ActionWeightTable> = {
  newcomer: {
    action_theater_training: 4,
    action_fan_service: 4,
    action_media_exposure: 0.5,
    action_stage_focus: 2.5,
    action_style_building: 1,
    action_rest_reflect: 2,
    action_steady_operation: 2,
  },
  growth: {
    action_theater_training: 3,
    action_fan_service: 4,
    action_media_exposure: 1.5,
    action_stage_focus: 3,
    action_style_building: 2.5,
    action_rest_reflect: 2,
    action_steady_operation: 3,
  },
  core: {
    action_theater_training: 3,
    action_fan_service: 4,
    action_media_exposure: 2.5,
    action_stage_focus: 4,
    action_style_building: 2.5,
    action_rest_reflect: 3,
    action_steady_operation: 4,
  },
  certification: {
    action_theater_training: 2,
    action_fan_service: 4,
    action_media_exposure: 3,
    action_stage_focus: 5,
    action_style_building: 2,
    action_rest_reflect: 3,
    action_steady_operation: 5,
  },
  sprint: {
    action_theater_training: 2,
    action_fan_service: 6,
    action_media_exposure: 4,
    action_stage_focus: 5,
    action_style_building: 2,
    action_rest_reflect: 4,
    action_steady_operation: 6,
  },
  flameFinale: {
    action_theater_training: 1,
    action_fan_service: 5,
    action_media_exposure: 5,
    action_stage_focus: 5,
    action_style_building: 1,
    action_rest_reflect: 5,
    action_steady_operation: 5,
  },
};

export function rollMonthlyActionOptions(state: GameState): MonthlyActionOption[] {
  const regularPlans = getRegularActionPlans();
  const selectedPlanIds: PlanId[] = [];

  getMandatoryPlanIds(state).forEach((planId) => {
    addUniquePlanId(selectedPlanIds, planId);
  });

  while (selectedPlanIds.length < MONTHLY_ACTION_OPTION_COUNT) {
    const availablePlans = regularPlans.filter((plan) => !selectedPlanIds.includes(plan.id));
    if (availablePlans.length === 0) {
      break;
    }

    const nextPlan = pickWeightedPlan(availablePlans, state);
    addUniquePlanId(selectedPlanIds, nextPlan.id);
  }

  return selectedPlanIds.slice(0, MONTHLY_ACTION_OPTION_COUNT).map((planId) => {
    const plan = PLAN_BY_ID[planId];
    const actionPoolId = plan.actionPoolId;

    return {
      id: `action-option-${state.currentYear}-${state.currentMonth}-${planId}`,
      year: state.year,
      currentYear: state.currentYear,
      currentMonth: state.currentMonth,
      planId,
      actionPoolId: actionPoolId as ActionPoolId,
      variantText: rollActionVariant(plan),
    };
  });
}

export function ensureMonthlyActionOptions(state: GameState): GameState {
  if (state.phase !== 'monthlyPlan') {
    return state;
  }

  const options = getCurrentMonthlyActionOptions(state);
  if (options.length === MONTHLY_ACTION_OPTION_COUNT) {
    return state;
  }

  return {
    ...state,
    monthlyActionOptions: rollMonthlyActionOptions(state),
  };
}

export function getCurrentMonthlyActionOptions(state: GameState): MonthlyActionOption[] {
  return state.monthlyActionOptions.filter(
    (option) =>
      option.currentYear === state.currentYear &&
      option.currentMonth === state.currentMonth &&
      Boolean(PLAN_BY_ID[option.planId]?.actionPoolId),
  );
}

export function findMonthlyActionOption(
  state: GameState,
  planId: PlanId,
): MonthlyActionOption | null {
  return getCurrentMonthlyActionOptions(state).find((option) => option.planId === planId) ?? null;
}

export function rollActionVariant(plan: PlanConfig): string {
  const variants = plan.variantPool ?? [];
  if (variants.length === 0) {
    return plan.name;
  }

  return variants[Math.floor(Math.random() * variants.length)];
}

export function getActionStageId(currentYear: number): ActionStageId {
  if (currentYear <= 2016) {
    return 'newcomer';
  }

  if (currentYear <= 2019) {
    return 'growth';
  }

  if (currentYear <= 2022) {
    return 'core';
  }

  if (currentYear <= 2024) {
    return 'certification';
  }

  if (currentYear <= 2025) {
    return 'sprint';
  }

  return 'flameFinale';
}

function getRegularActionPlans(): PlanConfig[] {
  return PLANS.filter((plan) => plan.actionPoolId && !plan.isSpecialAction);
}

function getMandatoryPlanIds(state: GameState): PlanId[] {
  const mandatory: PlanId[] = [];

  if (state.stamina < 25) {
    mandatory.push('restAndReflect');
  }

  if (state.pressure > 80 && !mandatory.includes('restAndReflect')) {
    mandatory.push('restAndReflect');
  }

  if (state.fanFatigue > 70) {
    mandatory.push('stableOperation');
  }

  return mandatory.slice(0, MONTHLY_ACTION_OPTION_COUNT);
}

function pickWeightedPlan(plans: PlanConfig[], state: GameState): PlanConfig {
  const stageId = getActionStageId(state.currentYear);
  const weights = ACTION_STAGE_WEIGHTS[stageId];
  const weightedPlans = plans.map((plan) => ({
    plan,
    weight: getAdjustedWeight(plan, state, weights),
  }));
  const totalWeight = weightedPlans.reduce((total, item) => total + item.weight, 0);

  if (totalWeight <= 0) {
    return plans[0];
  }

  let cursor = Math.random() * totalWeight;
  for (const item of weightedPlans) {
    cursor -= item.weight;
    if (cursor <= 0) {
      return item.plan;
    }
  }

  return weightedPlans[weightedPlans.length - 1].plan;
}

function getAdjustedWeight(
  plan: PlanConfig,
  state: GameState,
  weights: ActionWeightTable,
): number {
  const actionPoolId = plan.actionPoolId;
  if (!actionPoolId) {
    return 0;
  }

  let weight = weights[actionPoolId] ?? 0;
  if (state.mood < 30 && actionPoolId === 'action_rest_reflect') {
    weight *= 2;
  }

  return Math.max(0, weight);
}

function addUniquePlanId(planIds: PlanId[], planId: PlanId): void {
  if (!planIds.includes(planId)) {
    planIds.push(planId);
  }
}
