import type { CharacterImage } from '../types/game';
import { publicPath } from './publicPath';

const HOME_VISUAL_VERSION = '20260623_home_idle';

export const HOME_VISUAL: CharacterImage = {
  key: 'base',
  src: publicPath(`assets/home/base.png?v=${HOME_VISUAL_VERSION}`),
  alt: '杨小獭首页主视觉',
  label: '首页主视觉',
  placeholderText: '杨小獭',
};
