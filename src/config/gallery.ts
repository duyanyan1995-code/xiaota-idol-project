import type { GalleryItem } from '../types/game';

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'base',
    name: '初始主形象',
    imageKey: 'base',
    description: '刚开始踏上偶像养成之路的杨小獭，元气已经满满冒出来了。',
    conditionText: '默认解锁',
    isUnlocked: () => true,
  },
  {
    id: 'happy',
    name: '开心版',
    imageKey: 'happy',
    description: '心情亮晶晶的小獭，笑容会让练习室都变暖。',
    conditionText: '心情达到 85 或以上',
    isUnlocked: (state) => state.mood >= 85,
  },
  {
    id: 'tired',
    name: '疲惫版',
    imageKey: 'tired',
    description: '努力到有点累的小獭，需要被好好照顾。',
    conditionText: '体力低于 30',
    isUnlocked: (state) => state.energy < 30,
  },
  {
    id: 'wink',
    name: 'wink 营业版',
    imageKey: 'wink',
    description: '把元气 wink 送给粉丝的小獭，是营业天才预备役。',
    conditionText: '完成 3 次粉丝营业',
    isUnlocked: (state) => state.actionCounts.fanServiceCount >= 3,
  },
  {
    id: 'stage',
    name: '舞台服版',
    imageKey: 'stage',
    description: '站上舞台的小獭，正在把自己的光传递出去。',
    conditionText: '完成 3 次舞台演出',
    isUnlocked: (state) => state.actionCounts.stageCount >= 3,
  },
  {
    id: 'practice',
    name: '练习服版',
    imageKey: 'practice',
    description: '在练习室一点点变强的小獭，每一滴汗水都有意义。',
    conditionText: '完成任意训练 5 次',
    isUnlocked: (state) => state.actionCounts.trainingCount >= 5,
  },
  {
    id: 'summer',
    name: '夏日版',
    imageKey: 'summer',
    description: '参加夏日活动的小獭，像蜂蜜汽水一样清爽闪亮。',
    conditionText: '触发“夏日邀约”并选择参加活动',
    isUnlocked: (state) => state.summerJoined,
  },
];

