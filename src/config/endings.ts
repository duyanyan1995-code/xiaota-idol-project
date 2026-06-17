import type { EndingConfig } from '../types/game';

export const ENDINGS: EndingConfig[] = [
  {
    id: 'shiningRookie',
    name: '闪耀舞台新星',
    text: '小獭站上更大的舞台，终于把自己的光传递给了更多人。',
    isMatched: (state) => state.fans >= 1200 && state.popularity >= 70,
  },
  {
    id: 'genkiIdol',
    name: '元气营业小偶像',
    text: '每一次 wink 和笑容，都成为粉丝心里最温暖的记忆。',
    isMatched: (state) => state.charm >= 70 && state.fans >= 800,
  },
  {
    id: 'hardworkingTrainee',
    name: '努力练习生',
    text: '虽然还没有完全发光，但她已经在努力靠近舞台中央。',
    isMatched: (state) => state.vocal + state.dance >= 120,
  },
  {
    id: 'needsRest',
    name: '需要好好休息',
    text: '小獭已经很努力了，现在最需要的是被好好照顾。',
    isMatched: (state) => state.energy < 30 || state.mood < 30,
  },
];

export const FALLBACK_ENDING: EndingConfig = {
  id: 'gentleStart',
  name: '温柔起步',
  text: '这一个月里，小獭留下了很多小小进步。下一次，她还会继续向舞台靠近。',
  isMatched: () => true,
};

