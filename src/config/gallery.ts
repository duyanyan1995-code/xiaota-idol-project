import { ENDINGS, FALLBACK_ENDING } from './endings';
import type { AnnualCgKey, EndingCgKey, EventCgKey, GalleryItem, GameState, WorkCgKey } from '../types/game';
import { getEndingForState } from '../utils/endingLogic';

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
  createWorkCgGalleryItem(
    'girls_revolution',
    '少女革命作品记忆',
    '成长不只是变得更强，也是在一次次舞台里重新定义自己。',
    '少女革命达到 A 或 S',
    101,
  ),
  createWorkCgGalleryItem(
    'yy_ds',
    '歪歪DS作品记忆',
    '把陪伴、回应和个人色彩认真放进同一个夜晚。',
    '歪歪DS达到 A 或 S',
    102,
  ),
  createWorkCgGalleryItem(
    'xiaoyi',
    '小一作品记忆',
    '那些不夸张却足够清晰的瞬间，让人记住她的个人质感。',
    '小一达到 A 或 S',
    103,
  ),
  createWorkCgGalleryItem(
    'meteor_stream',
    'meteor stream作品记忆',
    '像流星划过夜空一样，被看见的瞬间成为舞台记忆。',
    'meteor stream达到 A 或 S',
    104,
  ),
  createWorkCgGalleryItem(
    'triones',
    'Triones作品记忆',
    '稳定、完整、默契和舞台掌控力在这里被放大。',
    'Triones达到 A 或 S',
    105,
  ),
  createWorkCgGalleryItem(
    'fu',
    'Fu作品记忆',
    '风格、表达和粉丝记忆在这一刻汇合。',
    'Fu达到 A 或 S',
    106,
  ),
  createWorkCgGalleryItem(
    'super_tata',
    'SuperTATA作品记忆',
    '轻快、鲜明、带有个人符号的舞台记忆被好好收录。',
    'SuperTATA达到 A 或 S',
    107,
  ),
  createWorkCgGalleryItem(
    'brand_mark',
    '烙印作品记忆',
    '高位阶段的代表作，把名字刻进这一年的记忆里。',
    '烙印达到 A 或 S',
    108,
  ),
  createWorkCgGalleryItem(
    'flame',
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
  ...[...ENDINGS, FALLBACK_ENDING].map((ending) =>
    createEndingCgGalleryItem(
      ending.endingCgKey,
      `${ending.name} CG`,
      ending.text,
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
  return {
    id,
    name,
    category: 'event',
    visual: {
      type: 'eventCg',
      key: id,
    },
    description,
    conditionText,
    isUnlocked: (state) => hasCompletedEventCg(state, id),
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
  id: WorkCgKey,
  name: string,
  description: string,
  conditionText: string,
  sortOrder: number,
  enabledInPhase: 'phase7' | 'phase8' = 'phase7',
): GalleryItem {
  return {
    id,
    name,
    category: 'work',
    sourceType: 'work',
    sourceId: id,
    visual: {
      type: 'workCg',
      key: id,
    },
    description,
    conditionText,
    sortOrder,
    enabledInPhase,
    lockedTitle: enabledInPhase === 'phase8' ? '终章预留' : '未收录',
    lockedHint: conditionText,
    isUnlocked: (state) =>
      enabledInPhase === 'phase7' &&
      (state.unlockedGalleryIds.includes(id) ||
        state.galleryUnlockHistory.some((record) => record.galleryId === id) ||
        state.workResults.some(
          (result) => result.workId === id && (result.grade === 'A' || result.grade === 'S'),
        )),
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
    visual: {
      type: 'endingCg',
      key: id,
    },
    description,
    conditionText,
    isUnlocked: (state) =>
      state.gameStatus === 'completed' && getEndingForState(state).galleryId === id,
  };
}
