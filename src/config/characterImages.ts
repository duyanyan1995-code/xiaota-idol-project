import type { CharacterImage, CharacterImageKey } from '../types/game';

export const CHARACTER_IMAGES: Record<CharacterImageKey, CharacterImage> = {
  base: {
    key: 'base',
    src: '/images/xiaota/base.png',
    alt: '杨小獭初始主形象',
    label: '初始主形象',
  },
  happy: {
    key: 'happy',
    src: '/images/xiaota/happy.png',
    alt: '杨小獭开心版',
    label: '开心版',
  },
  tired: {
    key: 'tired',
    src: '/images/xiaota/tired.png',
    alt: '杨小獭疲惫版',
    label: '疲惫版',
  },
  wink: {
    key: 'wink',
    src: '/images/xiaota/wink.png',
    alt: '杨小獭 wink 营业版',
    label: 'wink 营业版',
  },
  stage: {
    key: 'stage',
    src: '/images/xiaota/stage.png',
    alt: '杨小獭舞台服版',
    label: '舞台服版',
  },
  practice: {
    key: 'practice',
    src: '/images/xiaota/practice.png',
    alt: '杨小獭练习服版',
    label: '练习服版',
  },
  summer: {
    key: 'summer',
    src: '/images/xiaota/summer.png',
    alt: '杨小獭夏日版',
    label: '夏日版',
  },
};

