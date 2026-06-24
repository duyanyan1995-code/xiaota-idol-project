import { ELECTION_TIER_LABELS, ELECTION_TIER_NARRATIVES } from '../config/annualResults';
import { FINAL_CHAPTER_ELECTION_MONTH, FINAL_CHAPTER_YEAR } from '../config/annualCalendar';
import { FINAL_ENDINGS } from '../config/finalEndings';
import type {
  ElectionTier,
  EndingResult,
  EndingType,
  EventType,
  FinalElectionResult,
  GameState,
  StatDeltas,
  WorkGrade,
  WorkResult,
} from '../types/game';
import { isB50AtLeast, isElectionAtLeast } from './routeLogic';

const FINAL_ELECTION_TIER_ORDER: ElectionTier[] = [
  'outside',
  'ranked',
  'top48',
  'top32',
  'top16',
  'kami7',
  'top3',
  'center',
];

export function calculateFinalElectionResult(state: GameState): FinalElectionResult {
  const flame = getWorkResult(state, 'flame');
  const fansScore = normalizeFans(state.fanCount, 8200);
  const positiveEvents = countEvents(state, ['positive', 'milestone']);
  const recoveryEvents = countEvents(state, ['recovery']);
  const riskEvents = countEvents(state, ['risk', 'negative']);
  const asWorks = countWorksAtLeast(state, 'A');
  const sWorks = countWorksAtLeast(state, 'S');
  const topElection = getBestElectionIndex(state);
  const topB50 = getBestB50Index(state);
  const flameBonus = flame ? getWorkGradeScore(flame.grade) * 0.18 : 0;
  const legacyScore =
    asWorks * 2.4 +
    sWorks * 3.8 +
    topElection * 2.6 +
    topB50 * 1.8 +
    positiveEvents * 0.65 +
    recoveryEvents * 0.35 -
    riskEvents * 0.85;
  const riskPenalty =
    Math.max(0, state.fanFatigue - 72) * 0.22 +
    Math.max(0, state.pressure - 72) * 0.18 +
    Math.max(0, 38 - state.stamina) * 0.2 +
    Math.max(0, 38 - state.mood) * 0.16;
  const rawScore =
    fansScore * 0.24 +
    state.supportPower * 0.22 +
    state.influence * 0.18 +
    state.resource * 0.08 +
    state.charm * 0.08 +
    state.stagePower * 0.08 +
    state.operation * 0.05 +
    flameBonus +
    legacyScore -
    riskPenalty;
  const score = clamp(Math.round(rawScore), 0, 100);
  const tier = mapFinalElectionScoreToTier(score, state, flame);
  const resultLabel = ELECTION_TIER_LABELS[tier];

  return {
    id: `final-election-${FINAL_CHAPTER_YEAR}`,
    year: state.year,
    currentYear: FINAL_CHAPTER_YEAR,
    month: FINAL_CHAPTER_ELECTION_MONTH,
    type: 'finalElection',
    score,
    tier,
    resultLabel,
    narrative: ELECTION_TIER_NARRATIVES[tier],
    deltas: getFinalElectionRewards(tier),
    createdAtMonth: FINAL_CHAPTER_ELECTION_MONTH,
  };
}

export function resolveFinalEndingResult(state: GameState): EndingResult {
  const endingType = resolveEndingType(state);
  const definition = FINAL_ENDINGS[endingType];

  return {
    id: `ending-${definition.id}-${FINAL_CHAPTER_YEAR}`,
    endingType,
    title: definition.title,
    subtitle: definition.subtitle,
    narrative: definition.narrative,
    year: state.year,
    currentYear: FINAL_CHAPTER_YEAR,
    month: FINAL_CHAPTER_ELECTION_MONTH,
    sourceSummary: buildSourceSummary(state),
    keyReasons: buildKeyReasons(state, endingType),
    unlockedGalleryId: definition.galleryId,
    createdAtMonth: FINAL_CHAPTER_ELECTION_MONTH,
  };
}

export function getWorkResult(state: GameState, workId: string): WorkResult | null {
  return state.workResults.find((result) => result.workId === workId) ?? null;
}

export function countWorksAtLeast(state: GameState, minGrade: WorkGrade): number {
  return state.workResults.filter((result) => isWorkGradeAtLeast(result.grade, minGrade)).length;
}

export function countEvents(state: GameState, types: EventType[]): number {
  return state.eventHistory.filter((event) => event.eventType && types.includes(event.eventType)).length;
}

export function countRecentEvents(state: GameState, types: EventType[], months = 12): number {
  return state.eventHistory.filter((event) => {
    const distance = (state.currentYear - event.currentYear) * 12 + (state.currentMonth - event.currentMonth);
    return distance >= 0 && distance < months && event.eventType && types.includes(event.eventType);
  }).length;
}

function resolveEndingType(state: GameState): EndingType {
  const flame = getWorkResult(state, 'flame');
  const finalElection = state.finalElectionResult;
  const asWorks = countWorksAtLeast(state, 'A');
  const sWorks = countWorksAtLeast(state, 'S');
  const riskReason = getRiskEndingReason(state, flame, finalElection);
  const has2025HighElection = state.electionResults.some(
    (result) => result.currentYear === 2025 && isElectionAtLeast(result.tier, 'top3'),
  );
  const hasStrongLateWorks =
    asWorks >= 5 &&
    isWorkGradeAtLeast(getWorkResult(state, 'brand_mark')?.grade, 'A') &&
    isWorkGradeAtLeast(getWorkResult(state, 'fu')?.grade, 'A');

  if (riskReason) {
    return 'Risk';
  }

  const longTermMatches = [
    state.electionResults.some((result) => result.currentYear === 2025 && result.tier === 'center'),
    sWorks >= 2,
    asWorks >= 4,
    state.b50Results.some((result) => isB50AtLeast(result.tier, 'legend')),
    countEvents(state, ['milestone']) >= 4,
    countEvents(state, ['recovery']) >= Math.max(2, Math.floor(countEvents(state, ['risk']) / 2)),
    isWorkGradeAtLeast(getWorkResult(state, 'brand_mark')?.grade, 'A'),
    isWorkGradeAtLeast(getWorkResult(state, 'fu')?.grade, 'A'),
  ].filter(Boolean).length;

  if (
    flame?.grade === 'S' &&
    finalElection?.tier === 'center' &&
    (has2025HighElection || hasStrongLateWorks) &&
    state.supportPower >= 80 &&
    state.influence >= 80 &&
    state.stagePower >= 80 &&
    state.fanFatigue < 85 &&
    state.pressure < 90 &&
    longTermMatches >= 2
  ) {
    return 'S';
  }

  if (
    (isWorkGradeAtLeast(flame?.grade, 'A') && isFinalElectionAtLeast(finalElection?.tier, 'top3')) ||
    (flame?.grade === 'S' && isFinalElectionAtLeast(finalElection?.tier, 'kami7')) ||
    (finalElection?.tier === 'center' && flame?.grade === 'A')
  ) {
    return 'A';
  }

  if (asWorks === 0 && !isWorkGradeAtLeast(flame?.grade, 'A')) {
    return 'C';
  }

  if (
    isFinalElectionAtLeast(finalElection?.tier, 'top32') &&
    isWorkGradeAtLeast(flame?.grade, 'B') &&
    (asWorks >= 2 || state.supportPower >= 50 || state.influence >= 50 || state.stagePower >= 55)
  ) {
    return 'B';
  }

  return 'C';
}

function getRiskEndingReason(
  state: GameState,
  flame: WorkResult | null,
  finalElection: FinalElectionResult | null,
): string | null {
  if (state.stamina <= 10 || state.mood <= 15 || state.pressure >= 95) {
    return '状态崩盘';
  }

  if (state.fanFatigue >= 95 && state.supportPower <= 25) {
    return '应援盘严重透支';
  }

  const highRiskWarnings = Object.values(state.riskWarningCounts).some((count) => count >= 4);
  const recentRiskEvents = countRecentEvents(state, ['risk', 'negative'], 12);
  const recentRecoveryEvents = countRecentEvents(state, ['recovery'], 12);
  if (highRiskWarnings || (recentRiskEvents >= 5 && recentRecoveryEvents <= 1)) {
    return '风险事件连续未改善';
  }

  if (
    flame?.grade === 'C' &&
    (!finalElection || !isFinalElectionAtLeast(finalElection.tier, 'top48')) &&
    (state.pressure >= 86 || state.fanFatigue >= 86)
  ) {
    return '终章失败叠加风险';
  }

  return null;
}

function buildKeyReasons(state: GameState, endingType: EndingType): string[] {
  const flame = getWorkResult(state, 'flame');
  const finalElection = state.finalElectionResult;
  const asWorks = countWorksAtLeast(state, 'A');
  const sWorks = countWorksAtLeast(state, 'S');
  const riskEvents = countEvents(state, ['risk', 'negative']);
  const recoveryEvents = countEvents(state, ['recovery']);

  if (endingType === 'Risk') {
    return [
      '压力 / 体力 / 粉丝疲劳风险持续累积',
      `风险事件 ${riskEvents} 次，恢复事件 ${recoveryEvents} 次`,
      '终章前未能完全修复状态和应援节奏',
    ];
  }

  if (endingType === 'S') {
    return [
      'FLAME 成为终章高光',
      '最终总选登顶',
      '2025 年已经建立高位基础',
      `A/S 作品累计 ${asWorks} 个，其中 S 作品 ${sWorks} 个`,
      '粉丝盘在高压下仍保持稳定',
    ];
  }

  if (endingType === 'A') {
    return [
      `FLAME 结果：${flame?.grade ?? '未结算'}`,
      `最终总选：${finalElection?.resultLabel ?? '未结算'}`,
      '终章舞台表现突出',
      state.fanFatigue >= 70 || state.pressure >= 70 ? '风险控制仍有遗憾' : '距离连续登顶证明还差一步',
    ];
  }

  if (endingType === 'B') {
    return [
      '养成过程稳定推进',
      `A/S 作品累计 ${asWorks} 个`,
      `最终总选：${finalElection?.resultLabel ?? '未结算'}`,
      '终章突破还不够完整',
    ];
  }

  return [
    '粉丝盘未能形成稳定闭环',
    `A/S 作品累计 ${asWorks} 个`,
    `最终总选：${finalElection?.resultLabel ?? '未结算'}`,
    '作品记忆和应援声量仍有断层',
  ];
}

function buildSourceSummary(state: GameState): string {
  const flame = getWorkResult(state, 'flame');
  const finalElection = state.finalElectionResult;
  return `FLAME ${flame?.grade ?? '未结算'} · 最终总选 ${finalElection?.resultLabel ?? '未结算'} · A/S作品 ${countWorksAtLeast(state, 'A')} 个`;
}

function mapFinalElectionScoreToTier(
  score: number,
  state: GameState,
  flame: WorkResult | null,
): ElectionTier {
  let tier: ElectionTier = 'outside';
  if (score >= 88) tier = 'center';
  else if (score >= 80) tier = 'top3';
  else if (score >= 72) tier = 'kami7';
  else if (score >= 62) tier = 'top16';
  else if (score >= 52) tier = 'top32';
  else if (score >= 42) tier = 'top48';
  else if (score >= 34) tier = 'ranked';

  if (tier === 'center') {
    const highProof =
      flame?.grade === 'S' &&
      state.supportPower >= 78 &&
      state.influence >= 78 &&
      state.fanFatigue < 88 &&
      state.pressure < 92;
    if (!highProof) {
      tier = 'top3';
    }
  }

  if (tier === 'top3' && state.supportPower < 62) {
    tier = 'kami7';
  }

  return tier;
}

function getFinalElectionRewards(tier: ElectionTier): StatDeltas {
  const rewards: Record<ElectionTier, StatDeltas> = {
    outside: { pressure: 4 },
    ranked: { fanCount: 45, pressure: 2 },
    top48: { fanCount: 90, supportPower: 1, fanFatigue: 2 },
    top32: { fanCount: 130, supportPower: 2, influence: 2, fanFatigue: 3 },
    top16: { fanCount: 180, supportPower: 3, influence: 4, fanFatigue: 5 },
    kami7: { fanCount: 240, supportPower: 5, influence: 7, resource: 4, fanFatigue: 7 },
    top3: { fanCount: 310, supportPower: 7, influence: 10, resource: 7, fanFatigue: 9 },
    center: { fanCount: 420, supportPower: 9, influence: 13, resource: 10, fanFatigue: 11 },
  };
  return rewards[tier];
}

function getBestElectionIndex(state: GameState): number {
  return Math.max(
    0,
    ...state.electionResults.map((result) => getElectionTierIndex(result.tier)),
  );
}

function getBestB50Index(state: GameState): number {
  const order = ['notRanked', 'ranked', 'middle', 'high', 'highlight', 'legend'];
  return Math.max(0, ...state.b50Results.map((result) => (result.tier ? order.indexOf(result.tier) : 0)));
}

function isFinalElectionAtLeast(tier: ElectionTier | undefined, target: ElectionTier): boolean {
  if (!tier) {
    return false;
  }

  return FINAL_ELECTION_TIER_ORDER.indexOf(tier) >= FINAL_ELECTION_TIER_ORDER.indexOf(target);
}

function getElectionTierIndex(tier: unknown): number {
  const index = FINAL_ELECTION_TIER_ORDER.indexOf(tier as ElectionTier);
  return index >= 0 ? index : 0;
}

function isWorkGradeAtLeast(grade: WorkGrade | undefined, target: WorkGrade): boolean {
  if (!grade) {
    return false;
  }

  const order: WorkGrade[] = ['C', 'B', 'A', 'S'];
  return order.indexOf(grade) >= order.indexOf(target);
}

function getWorkGradeScore(grade: WorkGrade): number {
  const score: Record<WorkGrade, number> = {
    C: 30,
    B: 52,
    A: 76,
    S: 96,
  };
  return score[grade];
}

function normalizeFans(fans: number, target: number): number {
  return clamp(Math.sqrt(Math.max(0, fans)) / Math.sqrt(target) * 100, 0, 100);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
