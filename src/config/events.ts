import type { RandomEventConfig } from '../types/game';

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
        effects: {
          mood: 8,
          fans: 20,
          fanLoyalty: 3,
        },
        electionBonus: 2,
      },
      {
        id: 'keep',
        label: '收藏起来',
        resultText: '小獭把来信收进小盒子，偷偷开心了一整天。',
        effects: {
          mood: 5,
          fanLoyalty: 1,
        },
      },
    ],
  },
  {
    id: 'fanCreation',
    title: '粉丝二创出圈',
    description: '有粉丝剪的小獭舞台片段突然被更多人看见了。',
    choices: [
      {
        id: 'interact',
        label: '温柔互动',
        resultText: '小獭认真感谢粉丝，新的路人也被这份可爱吸引了。',
        effects: {
          popularity: 4,
          fans: 80,
          fanLoyalty: 3,
          stress: 4,
        },
        electionBonus: 4,
      },
      {
        id: 'quietLike',
        label: '悄悄点赞',
        resultText: '小獭悄悄点了赞，粉丝之间的陪伴感更强了。',
        effects: {
          mood: 4,
          fanLoyalty: 4,
        },
      },
    ],
  },
  {
    id: 'stageMistake',
    title: '舞台小失误',
    description: '彩排时出现了一个小失误，小獭有点在意。',
    choices: [
      {
        id: 'review',
        label: '复盘问题',
        resultText: '小獭把动作重新拆开练习，舞台稳定度提升了。',
        effects: {
          performance: 4,
          dance: 2,
          energy: -5,
          stress: 3,
        },
        b50Bonus: 3,
      },
      {
        id: 'comfort',
        label: '安慰小獭',
        resultText: '被好好安慰后，小獭又找回了笑容。',
        effects: {
          mood: 8,
          stress: -4,
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
        resultText: '加练很辛苦，但小獭的舞台基础更扎实了。',
        effects: {
          vocal: 3,
          dance: 3,
          performance: 2,
          energy: -8,
          stress: 5,
        },
        b50Bonus: 2,
      },
      {
        id: 'restNow',
        label: '及时休息',
        resultText: '小獭乖乖补充体力，状态轻轻回升。',
        effects: {
          energy: 8,
          mood: 3,
          stress: -5,
        },
      },
    ],
  },
  {
    id: 'styleChallenge',
    title: '想挑战不同风格',
    description: '小獭看着新的造型提案，眼睛里闪过一点期待。',
    choices: [
      {
        id: 'tryNew',
        label: '大胆尝试',
        resultText: '新的风格让小獭多了一种可瓜可花的可能性。',
        effects: {
          style: 6,
          charm: 2,
          stress: 4,
        },
      },
      {
        id: 'staySteady',
        label: '稳一点来',
        resultText: '小獭先把熟悉的表达做得更细，舞台感也更自然了。',
        effects: {
          performance: 3,
          fanLoyalty: 2,
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
        effects: {
          popularity: 6,
          fans: 70,
          energy: -10,
          style: 3,
        },
        flags: {
          summerJoined: true,
          summerActive: true,
        },
        electionBonus: 3,
      },
      {
        id: 'decline',
        label: '暂时婉拒',
        resultText: '小獭把节奏放慢了一点，安心调整状态。',
        effects: {
          energy: 5,
          mood: 2,
          stress: -3,
        },
      },
    ],
  },
  {
    id: 'lowMood',
    title: '心情低落',
    description: '连续忙碌之后，小獭今天有点提不起精神。',
    triggerCondition: (state) => state.mood < 55 || state.stress >= 65,
    choices: [
      {
        id: 'talk',
        label: '陪她聊聊',
        resultText: '被认真听见之后，小獭的心情慢慢软了下来。',
        effects: {
          mood: 10,
          stress: -8,
        },
      },
      {
        id: 'pushThrough',
        label: '完成排练',
        resultText: '小獭撑着完成排练，舞台经验增加了，但压力也更明显。',
        effects: {
          performance: 3,
          energy: -5,
          stress: 5,
        },
        b50Bonus: 1,
      },
    ],
  },
  {
    id: 'secretHappy',
    title: '被夸奖后偷偷开心',
    description: 'Staff 夸小獭今天进步很明显，她表面镇定，耳朵却红红的。',
    choices: [
      {
        id: 'acceptPraise',
        label: '大方接受',
        resultText: '小獭把夸奖好好收下，笑容也更有自信了。',
        effects: {
          mood: 6,
          charm: 2,
        },
      },
      {
        id: 'writeNotebook',
        label: '记进本子',
        resultText: '她把这句话写进练习本，像给未来的自己留下一颗星。',
        effects: {
          performance: 2,
          fanLoyalty: 2,
        },
      },
    ],
  },
];

export const FALLBACK_EVENT: RandomEventConfig = {
  id: 'dailyMoment',
  title: '普通但重要的一天',
  description: '没有特别大的事件，但小獭还是认真完成了今天的安排。',
  choices: [
    {
      id: 'steady',
      label: '稳稳收尾',
      resultText: '平凡的一天也有小小积累，小獭把状态保持住了。',
      effects: {
        mood: 2,
        fanLoyalty: 1,
      },
    },
    {
      id: 'earlySleep',
      label: '早点休息',
      resultText: '小獭早早睡下，第二天醒来时眼睛又亮了起来。',
      effects: {
        energy: 6,
        stress: -3,
      },
    },
  ],
};
