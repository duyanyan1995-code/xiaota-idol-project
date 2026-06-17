import type { EndingConfig } from '../types/game';

function highestB50Score(state: Parameters<EndingConfig['isMatched']>[0]): number {
  return Math.max(0, ...state.b50Results.map((result) => result.score));
}

function highestElectionScore(state: Parameters<EndingConfig['isMatched']>[0]): number {
  return Math.max(0, ...state.electionResults.map((result) => result.score));
}

export const ENDINGS: EndingConfig[] = [
  {
    id: 'topIdol',
    name: '顶点偶像',
    routeTag: '顶点路线',
    text: '十一年的舞台、营业和一次次选择，终于把小獭推向了最亮的位置。',
    finalLine: '“如果这束光能照到你那里，那我就还想继续唱下去。”',
    isMatched: (state) =>
      state.fans >= 5000 &&
      state.popularity >= 90 &&
      highestElectionScore(state) >= 90,
  },
  {
    id: 'stageLegend',
    name: '舞台传说',
    routeTag: '舞台实力派路线',
    text: '她用长期积累的唱跳和表现力，留下了粉丝会反复回看的传世名场面。',
    finalLine: '“每一次站上舞台，我都能听见大家的声音。”',
    isMatched: (state) => state.performance >= 85 && highestB50Score(state) >= 90,
  },
  {
    id: 'sunshine',
    name: '粉丝心中的小太阳',
    routeTag: '长期陪伴路线',
    text: '她没有错过每一次回应，也把粉丝的喜欢认真放在心上。',
    finalLine: '“是你们让我相信，温柔也可以很有力量。”',
    isMatched: (state) => state.fanLoyalty >= 85 && state.mood >= 70,
  },
  {
    id: 'allRounder',
    name: '可瓜可花全能偶像',
    routeTag: '全能风格路线',
    text: '可爱、帅气、治愈、闪耀，小獭把不同面貌都变成了自己的武器。',
    finalLine: '“今天的小獭，也可以是不一样的小獭。”',
    isMatched: (state) =>
      state.style >= 80 &&
      state.charm >= 80 &&
      state.vocal + state.dance + state.performance >= 210,
  },
  {
    id: 'theaterPillar',
    name: '努力派剧场支柱',
    routeTag: '剧场成长路线',
    text: '她不一定总在聚光灯最中央，却把每一次剧场公演都练到可靠。',
    finalLine: '“慢一点也没关系，我会把每一步都走稳。”',
    isMatched: (state) => state.vocal + state.dance + state.performance >= 200,
  },
  {
    id: 'longCompanion',
    name: '长期陪伴型偶像',
    routeTag: '陪伴沉淀路线',
    text: '十一个年头里，她和粉丝一起积累了很多普通但珍贵的日子。',
    finalLine: '“谢谢你一直都在，我也一直都记得。”',
    isMatched: (state) => state.yearSummaries.length >= 10 && state.fanLoyalty >= 65,
  },
  {
    id: 'shortSpark',
    name: '短暂闪光',
    routeTag: '人气爆发路线',
    text: '她曾经被很多人看见，也留下过漂亮的闪光瞬间。',
    finalLine: '“就算光停留得不久，那一刻也是真的。”',
    isMatched: (state) => state.popularity >= 75 && state.stress >= 70,
  },
  {
    id: 'needsRest',
    name: '需要好好休息',
    routeTag: '状态照护路线',
    text: '小獭已经很努力了，现在最需要的是被好好照顾。',
    finalLine: '“可以先陪我坐一会儿吗？明天再继续闪闪发光。”',
    isMatched: (state) => state.energy < 30 || state.mood < 30 || state.stress >= 85,
  },
];

export const FALLBACK_ENDING: EndingConfig = {
  id: 'ordinaryComplete',
  name: '普通完成结局',
  routeTag: '温柔完成路线',
  text: '十一年的路并不总是轰轰烈烈，但小獭确实认真走完了属于自己的偶像生涯。',
  finalLine: '“谢谢你陪我走到这里，这些日子我会一直记得。”',
  isMatched: () => true,
};
