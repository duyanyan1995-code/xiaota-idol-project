import { PLAN_BY_ID } from '../config/plans';
import type { GameState, PlanId } from '../types/game';

export type MainStateId = 'normal' | 'happy' | 'tired' | 'stressed';

export interface MainStateMeta {
  id: MainStateId;
  label: string;
  description: string;
}

const TIRED_STAMINA_THRESHOLD = 25;
const STRESSED_PRESSURE_THRESHOLD = 75;
const STRESSED_MOOD_THRESHOLD = 30;
const HAPPY_MOOD_THRESHOLD = 85;
const HAPPY_PRESSURE_LIMIT = 55;
const HAPPY_STAMINA_MINIMUM = 40;

export function getCurrentMainState(state: GameState): MainStateId {
  const { stamina, mood, pressure } = state;

  if (stamina < TIRED_STAMINA_THRESHOLD) {
    return 'tired';
  }

  if (pressure > STRESSED_PRESSURE_THRESHOLD || mood < STRESSED_MOOD_THRESHOLD) {
    return 'stressed';
  }

  if (
    mood >= HAPPY_MOOD_THRESHOLD &&
    pressure < HAPPY_PRESSURE_LIMIT &&
    stamina >= HAPPY_STAMINA_MINIMUM
  ) {
    return 'happy';
  }

  return 'normal';
}

export function getMainStateMeta(stateId: MainStateId): MainStateMeta {
  const meta: Record<MainStateId, MainStateMeta> = {
    normal: {
      id: 'normal',
      label: '普通状态',
      description: '节奏稳定，适合继续安排本月行动。',
    },
    happy: {
      id: 'happy',
      label: '状态良好',
      description: '心情明亮，舞台和营业都有不错的发挥空间。',
    },
    tired: {
      id: 'tired',
      label: '疲惫状态',
      description: '体力已经偏低，继续冲刺前最好留出恢复时间。',
    },
    stressed: {
      id: 'stressed',
      label: '高压状态',
      description: '压力或情绪状态需要关注，节奏太紧会积累风险。',
    },
  };

  return meta[stateId];
}

export function getCurrentTendencyLabel(state: GameState): string {
  if (state.stamina < 25) {
    return '状态承压';
  }

  if (state.pressure > 75) {
    return '压力累积中';
  }

  if (state.mood < 30) {
    return '情绪低落中';
  }

  if (state.fanFatigue > 60) {
    return '粉丝盘疲惫';
  }

  if (state.currentYear <= 2016) {
    return '新人适应中';
  }

  if (state.currentYear <= 2019) {
    return '成长探索中';
  }

  if (state.currentYear <= 2022) {
    return '核心稳定中';
  }

  if (state.currentYear <= 2024) {
    return '作品打磨中';
  }

  if (state.currentYear === 2025) {
    return '登顶冲刺中';
  }

  return '终章冲刺中';
}

export function getStatusWarnings(state: GameState): string[] {
  const warnings: string[] = [];

  if (state.stamina < 25) {
    warnings.push('体力偏低，建议安排休整沉淀。');
  }

  if (state.pressure > 75) {
    warnings.push('压力较高，建议安排休整或稳定运营。');
  }

  if (state.mood < 30) {
    warnings.push('心情低落，营业和形象经营效果可能下降。');
  }

  if (state.fanFatigue > 60) {
    warnings.push('粉丝盘开始疲惫，建议稳定运营。');
  }

  return warnings;
}

export function getActionHighlightLabel(planId: PlanId | null | undefined): string | null {
  if (!planId) {
    return null;
  }

  const highlights: Partial<Record<PlanId, string>> = {
    theaterTraining: '基础夯实',
    fanService: '粉丝反馈热烈',
    outsideExposure: '曝光破圈',
    stageFocus: '舞台专注',
    imageBuilding: '风格成形',
    restAndReflect: '状态回稳',
    stableOperation: '军心稳定',
  };

  return highlights[planId] ?? PLAN_BY_ID[planId]?.name ?? null;
}
