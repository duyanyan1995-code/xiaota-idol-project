import type { ActionConfig } from '../types/game';

export const ACTIONS: ActionConfig[] = [
  {
    id: 'vocalTraining',
    name: '声乐训练',
    shortName: '声乐',
    feedback: '今天认真练习了声乐，声音变得更稳定了。',
    deltas: {
      vocal: 8,
      energy: -15,
      mood: -3,
    },
    counters: {
      trainingCount: 1,
    },
  },
  {
    id: 'danceTraining',
    name: '舞蹈训练',
    shortName: '舞蹈',
    feedback: '练舞室里的小獭挥洒汗水，舞步更有力量了。',
    deltas: {
      dance: 8,
      energy: -18,
      mood: -4,
    },
    counters: {
      trainingCount: 1,
    },
  },
  {
    id: 'expressionPractice',
    name: '表情管理',
    shortName: '表情',
    feedback: '小獭对着镜子练习表情，营业力提升了。',
    deltas: {
      charm: 6,
      energy: -10,
      mood: -2,
    },
    counters: {
      trainingCount: 1,
    },
  },
  {
    id: 'fanService',
    name: '粉丝营业',
    shortName: '营业',
    feedback: '小獭认真营业，给粉丝送出了元气 wink。',
    deltas: {
      popularity: 5,
      fans: 30,
      energy: -12,
      mood: -5,
    },
    counters: {
      fanServiceCount: 1,
    },
  },
  {
    id: 'rest',
    name: '好好休息',
    shortName: '休息',
    feedback: '今天让小獭好好休息，状态恢复了一些。',
    deltas: {
      energy: 25,
      mood: 10,
    },
  },
  {
    id: 'stagePerformance',
    name: '舞台演出',
    shortName: '舞台',
    feedback: '小獭站上舞台，努力把闪闪发光的一面传递给大家。',
    getEffect: (state) => {
      const score = Math.round(
        state.vocal * 0.3 +
          state.dance * 0.3 +
          state.charm * 0.25 +
          state.popularity * 0.15,
      );
      const moodDelta = score > 80 ? 10 : score < 40 ? -5 : 0;

      return {
        score,
        deltas: {
          energy: -20,
          fans: score * 2,
          coins: score,
          mood: moodDelta,
        },
        counters: {
          stageCount: 1,
        },
      };
    },
  },
];

