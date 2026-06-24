import type { PlanId, StatDeltas, StatKey, ThemeNodeImportance, ThemeNodeType, WorkCgKey, WorkGrade } from '../types/game';

export interface ThemeNodeConfig {
  id: string;
  year: number;
  month: number;
  sourceName: string;
  title: string;
  nodeType: ThemeNodeType;
  importance: ThemeNodeImportance;
  description: string;
  focusStats?: StatKey[];
  relatedActions?: PlanId[];
  gradeEnabled: boolean;
  workId?: WorkCgKey;
  category?: 'performanceWork';
  gradeThresholds?: Record<WorkGrade, number>;
  rewardByGrade?: Record<WorkGrade, StatDeltas>;
  narrativeByGrade?: Record<WorkGrade, string>;
  milestoneByGrade?: Partial<Record<WorkGrade, { title: string; description: string }>>;
  potentialVisualKey?: WorkCgKey;
  phaseEnabled?: 'phase6' | 'phase8';
  timelineDeltas?: StatDeltas;
}

export const WORK_GRADE_THRESHOLDS: Record<WorkGrade, number> = {
  C: 0,
  B: 50,
  A: 70,
  S: 85,
};

export const WORK_GRADE_LABELS: Record<WorkGrade, string> = {
  C: '完成但记忆点不足',
  B: '稳定完成，有一定反馈',
  A: '形成代表性记忆',
  S: '年度级高光',
};

export const WORK_GRADE_NARRATIVES: Record<WorkGrade, string> = {
  C: '她完成了这一次舞台，但还没有真正留下足够鲜明的记忆点。不是失败，只是还需要更多时间，等她把自己想表达的东西磨得更清楚。',
  B: '这一次作品稳定地完成了。有人记住了她的表现，也有人开始期待她下一次能不能再往前一步。',
  A: '这一次，她不只是完成了作品，而是真的留下了属于自己的瞬间。那些被反复提起的细节，开始变成她成长路上的标记。',
  S: '这一刻成为了她这一阶段最重要的高光。不是偶然的闪亮，而是长期积累终于汇聚成能够被记住、被回望的作品记忆。',
};

export const WORK_REWARDS_BY_GRADE: Record<WorkGrade, StatDeltas> = {
  C: { pressure: 2, stagePower: 1, charm: 1 },
  B: { stagePower: 2, charm: 1, supportPower: 1, fanCount: 35 },
  A: { stagePower: 4, charm: 2, influence: 2, supportPower: 2, resource: 1, fanCount: 75 },
  S: { stagePower: 6, charm: 3, influence: 4, supportPower: 4, resource: 3, fanCount: 130 },
};

export const THEME_NODES: ThemeNodeConfig[] = [
  {
    id: 'x_team_debut',
    year: 2015,
    month: 4,
    sourceName: 'X队出道',
    title: 'X队初登场',
    nodeType: 'timeline',
    importance: 'normal',
    description: '她第一次以正式身份站上这个起点。灯光还没有完全偏向她，但那一刻开始，她拥有了被记住的可能。',
    focusStats: ['stagePower', 'supportPower'],
    relatedActions: ['theaterTraining', 'stableOperation'],
    gradeEnabled: false,
    timelineDeltas: { stagePower: 1, supportPower: 1 },
  },
  {
    id: 'ice_emperor_legend',
    year: 2015,
    month: 5,
    sourceName: '速报第一',
    title: '冰帝传说',
    nodeType: 'timeline',
    importance: 'key',
    description: '一次突然而来的高位信号，让更多人开始意识到：这个名字也许不该被轻易忽略。',
    focusStats: ['fanCount', 'supportPower', 'influence'],
    relatedActions: ['fanService', 'stableOperation'],
    gradeEnabled: false,
    timelineDeltas: { supportPower: 1, influence: 1, fanFatigue: 1 },
  },
  {
    id: 'eighteen_shining_moments',
    year: 2016,
    month: 4,
    sourceName: '十八个闪耀瞬间',
    title: '十八个闪耀瞬间',
    nodeType: 'timeline',
    importance: 'normal',
    description: '那些被记录下来的闪光片段，构成了她早期成长里最清晰的证明。',
    focusStats: ['stagePower', 'charm', 'supportPower'],
    relatedActions: ['theaterTraining', 'imageBuilding'],
    gradeEnabled: false,
    timelineDeltas: { charm: 1, fanCount: 25 },
  },
  {
    id: 'color_girls',
    year: 2017,
    month: 7,
    sourceName: '加入 COLOR GIRLS',
    title: '卡拉卡拉狗',
    nodeType: 'timeline',
    importance: 'key',
    description: '新的位置带来新的目光，也让她开始学习如何在更大的舞台体系里找到自己的颜色。',
    focusStats: ['charm', 'influence', 'stagePower'],
    relatedActions: ['imageBuilding', 'outsideExposure'],
    gradeEnabled: false,
    timelineDeltas: { influence: 1, charm: 1, pressure: 1 },
  },
  {
    id: 'vice_captain',
    year: 2018,
    month: 2,
    sourceName: '成为副队长',
    title: '肩负旗帜',
    nodeType: 'timeline',
    importance: 'key',
    description: '身份的变化意味着责任。她不只是向前走，也开始学会把身边的人一起带向前。',
    focusStats: ['operation', 'supportPower', 'pressure'],
    relatedActions: ['stableOperation', 'fanService'],
    gradeEnabled: false,
    timelineDeltas: { operation: 2, supportPower: 1, pressure: 1 },
  },
  {
    id: 'demoon',
    year: 2019,
    month: 1,
    sourceName: 'DEMOON',
    title: 'DEMOON',
    nodeType: 'timeline',
    importance: 'key',
    description: '这不是一次普通的舞台尝试。更锋利的节奏、更明确的表情和更强的舞台冲击，让她开始显露出不同于以往的一面。',
    focusStats: ['stagePower', 'dance', 'charm'],
    relatedActions: ['stageFocus', 'imageBuilding'],
    gradeEnabled: false,
    timelineDeltas: { stagePower: 2, charm: 1, pressure: 1 },
  },
  {
    id: 'captain_responsibility',
    year: 2020,
    month: 11,
    sourceName: '队长责任',
    title: '队长',
    nodeType: 'timeline',
    importance: 'key',
    description: '责任落到肩上之后，她要面对的不只是自己的舞台，还有更多人的期待、节奏和方向。',
    focusStats: ['operation', 'supportPower', 'pressure'],
    relatedActions: ['stableOperation', 'fanService'],
    gradeEnabled: false,
    timelineDeltas: { operation: 3, supportPower: 1, pressure: 2 },
  },
  createPerformanceWorkNode({
    id: 'girls_revolution_node',
    year: 2020,
    month: 12,
    sourceName: '少女革命',
    workId: 'girls_revolution',
    title: '少女革命',
    description: '成长不只是变得更强，也是在一次次舞台里重新定义自己。这个节点记录的是她从青涩走向坚定的瞬间。',
    focusStats: ['stagePower', 'vocal', 'dance', 'charm', 'supportPower'],
    relatedActions: ['stageFocus', 'theaterTraining', 'imageBuilding'],
  }),
  createPerformanceWorkNode({
    id: 'yy_ds_node',
    year: 2021,
    month: 7,
    sourceName: '歪歪DS',
    workId: 'yy_ds',
    title: '歪歪DS',
    description: '这是一场更靠近粉丝记忆的舞台。不是宏大的宣告，而是把陪伴、回应和个人色彩认真地放进同一个夜晚。',
    focusStats: ['charm', 'supportPower', 'fanCount', 'mood', 'operation'],
    relatedActions: ['fanService', 'stableOperation', 'imageBuilding'],
  }),
  createPerformanceWorkNode({
    id: 'xiaoyi_node',
    year: 2022,
    month: 10,
    sourceName: '小一',
    workId: 'xiaoyi',
    title: '小一',
    description: '她把更细腻的表达放进作品里。那些不夸张却足够清晰的瞬间，开始让人意识到她的个人质感。',
    focusStats: ['vocal', 'stagePower', 'charm', 'supportPower'],
    relatedActions: ['theaterTraining', 'stageFocus', 'imageBuilding'],
  }),
  createPerformanceWorkNode({
    id: 'meteor_stream_node',
    year: 2023,
    month: 7,
    sourceName: 'meteor stream',
    workId: 'meteor_stream',
    title: 'meteor stream',
    description: '像流星划过夜空一样，这个舞台需要速度、冲击力和被看见的瞬间。它考验的不只是完成度，也考验她能不能抓住目光。',
    focusStats: ['stagePower', 'dance', 'influence', 'charm'],
    relatedActions: ['stageFocus', 'outsideExposure', 'theaterTraining'],
  }),
  createPerformanceWorkNode({
    id: 'triones_node',
    year: 2024,
    month: 4,
    sourceName: 'Triones',
    workId: 'triones',
    title: 'Triones',
    description: '稳定、完整、默契和舞台掌控力在这里被放大。她需要证明自己不是偶然闪光，而是能够持续撑住舞台。',
    focusStats: ['stagePower', 'vocal', 'dance', 'supportPower'],
    relatedActions: ['stageFocus', 'theaterTraining', 'stableOperation'],
  }),
  createPerformanceWorkNode({
    id: 'fu_node',
    year: 2024,
    month: 6,
    sourceName: 'Fu',
    workId: 'fu',
    title: 'Fu',
    description: '风格、表达和粉丝记忆在这一刻汇合。她不再只是完成作品，而是在作品里留下了自己的烙印。',
    focusStats: ['charm', 'stagePower', 'influence', 'supportPower', 'operation'],
    relatedActions: ['imageBuilding', 'stageFocus', 'fanService'],
  }),
  createPerformanceWorkNode({
    id: 'super_tata_node',
    year: 2025,
    month: 1,
    sourceName: 'SuperTATA',
    workId: 'super_tata',
    title: 'SuperTATA',
    description: '轻快、鲜明、带有个人符号的舞台记忆，需要她把可爱、灵气和自我表达融合成一个容易被记住的瞬间。',
    focusStats: ['charm', 'fanCount', 'supportPower', 'influence', 'mood'],
    relatedActions: ['imageBuilding', 'fanService', 'outsideExposure'],
  }),
  createPerformanceWorkNode({
    id: 'brand_mark_node',
    year: 2025,
    month: 6,
    sourceName: '烙印',
    workId: 'brand_mark',
    title: '烙印',
    description: '这是高位阶段留下的证明。舞台不只是表演，也是一种宣告：她曾经走到这里，并把名字刻进这一年的记忆里。',
    focusStats: ['stagePower', 'influence', 'supportPower', 'fanCount', 'pressure'],
    relatedActions: ['stageFocus', 'fanService', 'outsideExposure'],
  }),
  createPerformanceWorkNode({
    id: 'flame_node',
    year: 2026,
    month: 6,
    sourceName: 'FLAME',
    workId: 'flame',
    title: 'FLAME',
    description: '这是终章前被点燃的火焰。过去所有积累、压力、期待与陪伴，都会在这里汇成最后的舞台。',
    focusStats: ['stagePower', 'influence', 'supportPower', 'fanCount', 'charm', 'pressure', 'fanFatigue'],
    relatedActions: ['stageFocus', 'fanService', 'outsideExposure', 'imageBuilding'],
    phaseEnabled: 'phase8',
  }),
];

function createPerformanceWorkNode(config: {
  id: string;
  year: number;
  month: number;
  sourceName: string;
  workId: WorkCgKey;
  title: string;
  description: string;
  focusStats: StatKey[];
  relatedActions: PlanId[];
  phaseEnabled?: 'phase6' | 'phase8';
}): ThemeNodeConfig {
  return {
    ...config,
    nodeType: 'performanceWork',
    importance: 'key',
    category: 'performanceWork',
    gradeEnabled: true,
    gradeThresholds: WORK_GRADE_THRESHOLDS,
    rewardByGrade: WORK_REWARDS_BY_GRADE,
    narrativeByGrade: WORK_GRADE_NARRATIVES,
    milestoneByGrade: {
      A: {
        title: '代表作成形',
        description: '这一阶段的作品开始被粉丝稳定记住。',
      },
      S: {
        title: '年度作品高光',
        description: '这一作品成为本阶段的关键记忆点。',
      },
    },
    potentialVisualKey: config.workId,
    phaseEnabled: config.phaseEnabled ?? 'phase6',
  };
}
