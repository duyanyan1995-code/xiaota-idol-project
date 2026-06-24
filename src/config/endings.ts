import { RANDOM_EVENTS } from './events';
import type { EndingConfig, GameState, PlanId, RouteId } from '../types/game';
import { getTopRoutes, isB50AtLeast, isElectionAtLeast } from '../utils/routeLogic';

const EVENT_CONFIG_BY_ID = RANDOM_EVENTS.reduce<
  Record<string, { tone: string; triggerTags: string[] }>
>((result, event) => {
  result[event.id] = {
    tone: event.tone,
    triggerTags: event.triggerTags,
  };
  return result;
}, {});

export const ENDINGS: EndingConfig[] = [
  {
    id: 'idolPeak',
    name: '偶像顶点',
    title: '偶像顶点结局',
    routeTag: '顶点路线',
    text: '十一年的舞台、营业和一次次选择，终于把小獭推向了最亮的位置。她把自己的光传递给更多人，也把这段陪伴变成了真正的顶点时刻。',
    finalLine: '“如果这束光能照到你那里，那我就还想继续唱下去。”',
    endingCgKey: 'idolPeakEndingCg',
    galleryId: 'idolPeakEndingCg',
    priority: 100,
    isMatched: (state) =>
      hasElectionTier(state, 'center') &&
      state.fanCount >= 6500 &&
      state.supportPower >= 80 &&
      state.influence >= 80 &&
      countNegativeEvents(state) <= 8,
  },
  {
    id: 'kamiSeven',
    name: '神七高位',
    title: '神七高位结局',
    routeTag: '高位影响力路线',
    text: '小獭没有只靠一瞬间的热度，而是用稳定的努力和回应，把名字留在了更高的位置。',
    finalLine: '“能被大家推到这里，我真的有好好接住这份喜欢。”',
    endingCgKey: 'kamiSevenEndingCg',
    galleryId: 'kamiSevenEndingCg',
    priority: 90,
    isMatched: (state) =>
      hasElectionTier(state, 'kami7') &&
      state.fanCount >= 4300 &&
      state.supportPower >= 65 &&
      state.influence >= 65,
  },
  {
    id: 'top16Core',
    name: 'TOP16 稳定核心',
    title: 'TOP16 稳定核心结局',
    routeTag: '核心成员路线',
    text: '她逐渐成为队伍里可靠又闪亮的存在。不是每一年都轰轰烈烈，但每一次上升都扎实地留下了痕迹。',
    finalLine: '“我会继续站在这里，让大家每次回头都能看到我。”',
    endingCgKey: 'top16CoreEndingCg',
    galleryId: 'top16CoreEndingCg',
    priority: 80,
    isMatched: (state) =>
      hasElectionTier(state, 'top16') ||
      state.electionResults.filter((result) => isElectionAtLeast(result.tier, 'top32')).length >= 4,
  },
  {
    id: 'theaterLegend',
    name: '剧场传说',
    title: '剧场传说结局',
    routeTag: '剧场成长路线',
    text: '她把一次次剧场公演练到可靠，把并不起眼的日常变成了粉丝心里最踏实的传说。',
    finalLine: '“慢一点也没关系，我会把每一步都走稳。”',
    endingCgKey: 'theaterLegendEndingCg',
    galleryId: 'theaterLegendEndingCg',
    priority: 70,
    isMatched: (state) =>
      getPlanCount(state, 'theaterTraining') >= 24 &&
      state.vocal + state.dance + state.stagePower >= 520 &&
      hasRoute(state, 'stage', 90),
  },
  {
    id: 'stageMemory',
    name: '舞台记忆',
    title: '舞台记忆结局',
    routeTag: '舞台名场面路线',
    text: '这一年的舞台被反复提起。灯光亮起的时候，小獭终于留下了会被许多人记住的代表性瞬间。',
    finalLine: '“每一次站上舞台，我都能听见大家的声音。”',
    endingCgKey: 'stageMemoryEndingCg',
    galleryId: 'stageMemoryEndingCg',
    priority: 68,
    isMatched: (state) =>
      hasB50Tier(state, 'highlight') &&
      state.stagePower >= 180 &&
      getPlanCount(state, 'stageFocus') + getPlanCount(state, 'specialIntensiveTraining') >= 16,
  },
  {
    id: 'fanBond',
    name: '粉丝羁绊',
    title: '粉丝羁绊结局',
    routeTag: '长期陪伴路线',
    text: '她没有错过每一次回应，也把粉丝的喜欢认真放在心上。那些普通月份堆在一起，变成了最珍贵的羁绊。',
    finalLine: '“是你们让我相信，温柔也可以很有力量。”',
    endingCgKey: 'fanBondEndingCg',
    galleryId: 'fanBondEndingCg',
    priority: 60,
    isMatched: (state) =>
      state.supportPower >= 180 &&
      getPlanCount(state, 'fanService') + getPlanCount(state, 'specialBirthdaySupport') >= 18,
  },
  {
    id: 'outsideBreakthrough',
    name: '外务突破',
    title: '外务突破结局',
    routeTag: '外部认知路线',
    text: '小獭开始被更多舞台之外的人看见。节目、企划和讨论声里，她的名字逐渐有了新的位置。',
    finalLine: '“原来我也可以走到更远的地方，被更多人记住。”',
    endingCgKey: 'outsideBreakthroughEndingCg',
    galleryId: 'outsideBreakthroughEndingCg',
    priority: 55,
    isMatched: (state) =>
      state.influence >= 180 &&
      state.charm >= 120 &&
      getPlanCount(state, 'outsideExposure') + getPlanCount(state, 'specialSoloWork') >= 16,
  },
  {
    id: 'steadyOperation',
    name: '稳定运营',
    title: '稳定运营结局',
    routeTag: '低风险稳定路线',
    text: '她没有选择最冒险的路线，却认真走完了每一个月份。稳定、健康、持续，也是偶像生涯里很难得的答案。',
    finalLine: '“谢谢你一直都在，我也一直都记得。”',
    endingCgKey: 'steadyOperationEndingCg',
    galleryId: 'steadyOperationEndingCg',
    priority: 50,
    isMatched: (state) =>
      hasRoute(state, 'stable', 70) &&
      state.stamina >= 50 &&
      state.pressure <= 45 &&
      state.yearSummaries.length >= 10,
  },
];

export const FALLBACK_ENDING: EndingConfig = {
  id: 'regretGraduation',
  name: '遗憾毕业',
  title: '遗憾毕业 / 未能进圈结局',
  routeTag: '遗憾完成路线',
  text: '这一路并不总是顺利。她已经很努力了，只是这一次还没能把光传到足够远的地方。',
  finalLine: '“谢谢你陪我走到这里，哪怕有遗憾，这些日子也是真的。”',
  endingCgKey: 'regretGraduationEndingCg',
  galleryId: 'regretGraduationEndingCg',
  priority: 0,
  isMatched: () => true,
};

function hasElectionTier(state: GameState, tier: string): boolean {
  return state.electionResults.some((result) => isElectionAtLeast(result.tier, tier));
}

function hasB50Tier(state: GameState, tier: string): boolean {
  return state.b50Results.some((result) => isB50AtLeast(result.tier, tier));
}

function hasRoute(state: GameState, route: RouteId, minScore: number): boolean {
  return (getTopRoutes(state, 6).find((entry) => entry.id === route)?.score ?? 0) >= minScore;
}

function getPlanCount(state: GameState, planId: PlanId): number {
  return state.planHistory.filter((entry) => entry.planId === planId).length;
}

function countNegativeEvents(state: GameState): number {
  return state.eventHistory.filter((entry) => EVENT_CONFIG_BY_ID[entry.eventId]?.tone === 'negative').length;
}
