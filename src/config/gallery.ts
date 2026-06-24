import { FINAL_ENDINGS } from './finalEndings';
import type {
  AnnualCgKey,
  EndingCgKey,
  EventCgKey,
  GalleryItem,
  GameState,
  TimelineCgKey,
  WorkCgKey,
  WorkGalleryId,
} from '../types/game';

const READY_EVENT_CGS = new Set<EventCgKey>([
  'fanLetterCg',
  'fanCreationCg',
  'stageMistakeCg',
  'extraPracticeCg',
  'styleChallengeCg',
  'summerInviteCg',
  'lowMoodCg',
  'secretHappyCg',
]);

const READY_TIMELINE_CGS = new Set<TimelineCgKey>([
  'timeline_x_team_debut',
  'timeline_quick_report_first',
  'timeline_color_girls',
  'timeline_vice_captain',
  'timeline_demoon',
]);

const READY_WORK_CGS = new Set<WorkGalleryId>(['work_girls_revolution']);

const WORK_GALLERY_TO_VISUAL: Record<WorkGalleryId, WorkCgKey> = {
  work_girls_revolution: 'girls_revolution',
  work_yy_ds: 'yy_ds',
  work_xiaoyi: 'xiaoyi',
  work_meteor_stream: 'meteor_stream',
  work_triones: 'triones',
  work_fu: 'fu',
  work_super_tata: 'super_tata',
  work_brand_mark: 'brand_mark',
  work_flame: 'flame',
};

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'base',
    name: '初始主形象',
    category: 'character',
    visual: {
      type: 'legacy',
      key: 'base',
    },
    description: '刚开始踏上偶像养成之路的杨小獭，元气已经满满冒出来了。',
    conditionText: '默认解锁',
    isUnlocked: () => true,
  },
  {
    id: 'happy',
    name: '开心版',
    category: 'character',
    visual: {
      type: 'legacy',
      key: 'happy',
    },
    description: '心情亮晶晶的小獭，笑容会让练习室都变暖。',
    conditionText: '心情达到 85 或以上',
    isUnlocked: (state) => state.mood >= 85,
  },
  {
    id: 'tired',
    name: '疲惫版',
    category: 'character',
    visual: {
      type: 'legacy',
      key: 'tired',
    },
    description: '努力到有点累的小獭，需要被好好照顾。',
    conditionText: '体力低于 30',
    isUnlocked: (state) => state.stamina < 30,
  },
  {
    id: 'wink',
    name: 'wink 营业版',
    category: 'character',
    visual: {
      type: 'legacy',
      key: 'wink',
    },
    description: '把元气 wink 送给粉丝的小獭，是营业天才预备役。',
    conditionText: '完成 3 次粉丝营业计划',
    isUnlocked: (state) =>
      state.planHistory.filter((entry) => entry.planId === 'fanService').length >= 3,
  },
  {
    id: 'stage',
    name: '舞台服版',
    category: 'character',
    visual: {
      type: 'legacy',
      key: 'stage',
    },
    description: '站上舞台的小獭，正在把自己的光传递出去。',
    conditionText: '完成 3 次 B50 舞台记忆节点',
    isUnlocked: (state) => state.b50Results.length >= 3,
  },
  {
    id: 'practice',
    name: '练习服版',
    category: 'character',
    visual: {
      type: 'legacy',
      key: 'practice',
    },
    description: '在练习室一点点变强的小獭，每一滴汗水都有意义。',
    conditionText: '完成剧场训练或舞台专项累计 5 次',
    isUnlocked: (state) =>
      state.planHistory.filter(
        (entry) => entry.planId === 'theaterTraining' || entry.planId === 'stageFocus',
      ).length >= 5,
  },
  {
    id: 'summer',
    name: '夏日版',
    category: 'character',
    visual: {
      type: 'legacy',
      key: 'summer',
    },
    description: '参加夏日活动的小獭，像蜂蜜汽水一样清爽闪亮。',
    conditionText: '触发“夏日邀约”并选择参加活动',
    isUnlocked: (state) => Boolean(state.eventFlags.summerJoined),
  },
  createEventCgGalleryItem(
    'fanLetterCg',
    '粉丝来信 CG',
    '收到粉丝来信时，小獭把那份喜欢认真收进心里。',
    '完成“粉丝来信”事件',
  ),
  createEventCgGalleryItem(
    'fanCreationCg',
    '粉丝二创出圈 CG',
    '粉丝创作让更多人看见小獭，也让这份陪伴轻轻扩散。',
    '完成“粉丝二创出圈”事件',
  ),
  createEventCgGalleryItem(
    'stageMistakeCg',
    '舞台小失误 CG',
    '一次小失误之后，小獭学会了把不安拆成下一次进步。',
    '完成“舞台小失误”事件',
  ),
  createEventCgGalleryItem(
    'extraPracticeCg',
    '练习室加练 CG',
    '练习室里多留的一会儿，也会变成舞台上的一点光。',
    '完成“练习室加练”事件',
  ),
  createEventCgGalleryItem(
    'styleChallengeCg',
    '风格挑战 CG',
    '新的风格提案让小獭看见了自己更多面的可能。',
    '完成“想挑战不同风格”事件',
  ),
  createEventCgGalleryItem(
    'summerInviteCg',
    '夏日邀约 CG',
    '夏日活动里的小獭，像蜂蜜汽水一样清爽闪亮。',
    '完成“夏日邀约”事件',
  ),
  createEventCgGalleryItem(
    'lowMoodCg',
    '心情低落 CG',
    '状态低落的时候，陪伴和照顾也会成为很重要的养成。',
    '完成“心情低落”事件',
  ),
  createEventCgGalleryItem(
    'secretHappyCg',
    '偷偷开心 CG',
    '被夸奖后偷偷开心的小獭，把这句话藏进了练习本。',
    '完成“被夸奖后偷偷开心”事件',
  ),
  createTimelineCgGalleryItem(
    'timeline_x_team_debut',
    'X队初登场',
    '她第一次以正式身份站上这个起点。',
    '2015 年 4 月触发 X队初登场',
    51,
  ),
  createTimelineCgGalleryItem(
    'timeline_quick_report_first',
    '冰帝传说',
    '一次突然而来的高位信号，让更多人开始意识到这个名字。',
    '2015 年 5 月触发冰帝传说',
    52,
  ),
  createTimelineCgGalleryItem(
    'timeline_eighteen_shining_moments',
    '十八个闪耀瞬间',
    '早期成长里被记录下来的闪光片段。',
    '2016 年 4 月触发十八个闪耀瞬间',
    53,
  ),
  createTimelineCgGalleryItem(
    'timeline_color_girls',
    '卡拉卡拉狗',
    '新的位置带来新的目光，也让她开始找到自己的颜色。',
    '2017 年 7 月触发卡拉卡拉狗',
    54,
  ),
  createTimelineCgGalleryItem(
    'timeline_vice_captain',
    '肩负旗帜',
    '身份变化意味着责任，也意味着新的成长。',
    '2018 年 2 月触发肩负旗帜',
    55,
  ),
  createTimelineCgGalleryItem(
    'timeline_demoon',
    'DEMOON',
    '更锋利的节奏和更强的舞台冲击，留下不同以往的一面。',
    '2019 年 1 月触发 DEMOON',
    56,
  ),
  createTimelineCgGalleryItem(
    'timeline_captain',
    '队长',
    '责任落到肩上之后，她面对的不只是自己的舞台。',
    '2020 年 11 月触发队长',
    57,
  ),
  createWorkCgGalleryItem(
    'work_girls_revolution',
    '少女革命作品记忆',
    '成长不只是变得更强，也是在一次次舞台里重新定义自己。',
    '少女革命达到 A 或 S',
    101,
  ),
  createWorkCgGalleryItem(
    'work_yy_ds',
    '歪歪DS作品记忆',
    '把陪伴、回应和个人色彩认真放进同一个夜晚。',
    '歪歪DS达到 A 或 S',
    102,
  ),
  createWorkCgGalleryItem(
    'work_xiaoyi',
    '小一作品记忆',
    '那些不夸张却足够清晰的瞬间，让人记住她的个人质感。',
    '小一达到 A 或 S',
    103,
  ),
  createWorkCgGalleryItem(
    'work_meteor_stream',
    'meteor stream作品记忆',
    '像流星划过夜空一样，被看见的瞬间成为舞台记忆。',
    'meteor stream达到 A 或 S',
    104,
  ),
  createWorkCgGalleryItem(
    'work_triones',
    'Triones作品记忆',
    '稳定、完整、默契和舞台掌控力在这里被放大。',
    'Triones达到 A 或 S',
    105,
  ),
  createWorkCgGalleryItem(
    'work_fu',
    'Fu作品记忆',
    '风格、表达和粉丝记忆在这一刻汇合。',
    'Fu达到 A 或 S',
    106,
  ),
  createWorkCgGalleryItem(
    'work_super_tata',
    'SuperTATA作品记忆',
    '轻快、鲜明、带有个人符号的舞台记忆被好好收录。',
    'SuperTATA达到 A 或 S',
    107,
  ),
  createWorkCgGalleryItem(
    'work_brand_mark',
    '烙印作品记忆',
    '高位阶段的代表作，把名字刻进这一年的记忆里。',
    '烙印达到 A 或 S',
    108,
  ),
  createWorkCgGalleryItem(
    'work_flame',
    'FLAME终章记忆',
    '终章舞台视觉预留，正式触发将在 Phase 8 接入。',
    '终章阶段开放',
    199,
    'phase8',
  ),
  createAnnualCgGalleryItem(
    'election_champion',
    '总选高光记忆',
    '年度人气顶点的视觉记忆预留。',
    '后续年度视觉开放',
    201,
  ),
  createAnnualCgGalleryItem(
    'b50_highlight',
    'B50高光记忆',
    '年度舞台名场面的视觉记忆预留。',
    '后续年度视觉开放',
    202,
  ),
  ...Object.values(FINAL_ENDINGS).map((ending) =>
    createEndingCgGalleryItem(
      ending.endingCgKey,
      `${ending.title} CG`,
      ending.narrative,
      `达成“${ending.title}”`,
    ),
  ),
];

function createEventCgGalleryItem(
  id: EventCgKey,
  name: string,
  description: string,
  conditionText: string,
): GalleryItem {
  const assetReady = READY_EVENT_CGS.has(id);
  return {
    id,
    name,
    category: 'event',
    sourceType: 'event',
    sourceId: id,
    assetReady,
    visual: {
      type: 'eventCg',
      key: id,
    },
    description,
    conditionText,
    lockedTitle: assetReady ? '未收录' : 'CG待补充',
    lockedHint: assetReady ? conditionText : '素材未就绪，暂不在流程中弹出',
    isUnlocked: (state) => assetReady && hasCompletedEventCg(state, id),
  };
}

function hasCompletedEventCg(state: GameState, id: EventCgKey): boolean {
  return (
    state.unlockedGalleryIds.includes(id) ||
    state.galleryUnlockHistory.some((record) => record.galleryId === id) ||
    state.eventHistory.some((event) => event.galleryId === id)
  );
}

function createWorkCgGalleryItem(
  id: WorkGalleryId,
  name: string,
  description: string,
  conditionText: string,
  sortOrder: number,
  enabledInPhase: 'phase7' | 'phase8' = 'phase7',
): GalleryItem {
  const assetReady = READY_WORK_CGS.has(id);
  const visualKey = WORK_GALLERY_TO_VISUAL[id];

  return {
    id,
    name,
    category: 'work',
    sourceType: 'work',
    sourceId: visualKey,
    assetReady,
    visual: {
      type: 'workCg',
      key: visualKey,
    },
    description,
    conditionText,
    sortOrder,
    enabledInPhase,
    lockedTitle: assetReady ? '未收录' : 'CG待补充',
    lockedHint: assetReady ? conditionText : '素材未就绪，暂不在流程中弹出',
    isUnlocked: (state) =>
      assetReady &&
      (state.unlockedGalleryIds.includes(id) ||
        state.galleryUnlockHistory.some((record) => record.galleryId === id) ||
        state.workResults.some(
          (result) => result.galleryId === id && (result.grade === 'A' || result.grade === 'S'),
        )),
  };
}

function createTimelineCgGalleryItem(
  id: TimelineCgKey,
  name: string,
  description: string,
  conditionText: string,
  sortOrder: number,
): GalleryItem {
  const assetReady = READY_TIMELINE_CGS.has(id);

  return {
    id,
    name,
    category: 'timeline',
    sourceType: 'timeline',
    sourceId: id.replace(/^timeline_/, ''),
    assetReady,
    visual: {
      type: 'timelineCg',
      key: id,
    },
    description,
    conditionText,
    sortOrder,
    lockedTitle: assetReady ? '未收录' : 'CG待补充',
    lockedHint: assetReady ? conditionText : '素材缺失，已列入补图清单',
    isUnlocked: (state) =>
      assetReady &&
      (state.unlockedGalleryIds.includes(id) ||
        state.galleryUnlockHistory.some((record) => record.galleryId === id) ||
        state.themeNodeResults.some((result) => result.potentialVisualKey === id)),
  };
}

function createAnnualCgGalleryItem(
  id: AnnualCgKey,
  name: string,
  description: string,
  conditionText: string,
  sortOrder: number,
): GalleryItem {
  return {
    id,
    name,
    category: 'annual',
    sourceType: 'annual',
    sourceId: id,
    assetReady: false,
    visual: {
      type: 'annualCg',
      key: id,
    },
    description,
    conditionText,
    sortOrder,
    enabledInPhase: 'phase8',
    lockedTitle: '后续开放',
    lockedHint: conditionText,
    isUnlocked: () => false,
  };
}

function createEndingCgGalleryItem(
  id: EndingCgKey,
  name: string,
  description: string,
  conditionText: string,
): GalleryItem {
  return {
    id,
    name,
    category: 'ending',
    sourceType: 'ending',
    sourceId: id,
    assetReady: false,
    visual: {
      type: 'endingCg',
      key: id,
    },
    description,
    conditionText,
    lockedTitle: '结局CG待补充',
    lockedHint: '素材未就绪，暂不在流程中弹出',
    isUnlocked: () => false,
  };
}

export function isGalleryAssetReady(id: string): boolean {
  return GALLERY_ITEMS.find((item) => item.id === id)?.assetReady === true;
}
