import type { RandomEventConfig } from '../types/game';

export const RANDOM_EVENT_CHANCE = 0.25;

export const RANDOM_EVENTS: RandomEventConfig[] = [
  {
    id: 'fanLetter',
    title: '粉丝来信',
    description: '收到了一封粉丝来信，小獭看完后眼睛亮亮的。',
    choices: [
      {
        id: 'reply',
        label: '认真回复',
        resultText: '小獭认真写下回复，心里被温柔填满了。',
        deltas: {
          mood: 8,
          fans: 10,
        },
      },
      {
        id: 'keep',
        label: '收藏起来',
        resultText: '小獭把来信收进小盒子，偷偷开心了一整天。',
        deltas: {
          mood: 5,
        },
      },
    ],
  },
  {
    id: 'extraPractice',
    title: '练习室加练',
    description: '小獭觉得今天还能再努力一点。',
    choices: [
      {
        id: 'continue',
        label: '继续加练',
        resultText: '加练很辛苦，但小獭的基础更扎实了。',
        deltas: {
          vocal: 3,
          dance: 3,
          energy: -8,
        },
      },
      {
        id: 'restNow',
        label: '及时休息',
        resultText: '小獭乖乖补充体力，状态轻轻回升。',
        deltas: {
          energy: 8,
          mood: 3,
        },
      },
    ],
  },
  {
    id: 'lostHairpin',
    title: '小獭发夹不见了',
    description: '最喜欢的小獭发夹突然找不到了。',
    choices: [
      {
        id: 'findTogether',
        label: '一起找',
        resultText: '终于在包包夹层找到了发夹，小獭松了一口气。',
        deltas: {
          mood: 6,
        },
      },
      {
        id: 'trainFirst',
        label: '先去训练',
        resultText: '小獭忍住在意去训练，歌声进步了一点点。',
        deltas: {
          vocal: 2,
          mood: -3,
        },
      },
    ],
  },
  {
    id: 'stageMistake',
    title: '舞台小失误',
    description: '彩排时出现了一个小失误。',
    choices: [
      {
        id: 'review',
        label: '复盘问题',
        resultText: '小獭把动作重新拆开练习，表现更稳了。',
        deltas: {
          dance: 4,
          charm: 2,
          energy: -5,
        },
      },
      {
        id: 'comfort',
        label: '安慰小獭',
        resultText: '被好好安慰后，小獭又找回了笑容。',
        deltas: {
          mood: 8,
        },
      },
    ],
  },
  {
    id: 'summerInvite',
    title: '夏日邀约',
    description: '收到了一份夏日活动邀约。',
    choices: [
      {
        id: 'join',
        label: '参加活动',
        resultText: '夏日活动顺利完成，小獭收获了新的关注。',
        deltas: {
          popularity: 8,
          fans: 50,
          energy: -10,
        },
        temporaryState: 'summer',
        summerJoined: true,
      },
      {
        id: 'decline',
        label: '暂时婉拒',
        resultText: '小獭把节奏放慢了一点，安心调整状态。',
        deltas: {
          energy: 5,
          mood: 2,
        },
      },
    ],
  },
];

