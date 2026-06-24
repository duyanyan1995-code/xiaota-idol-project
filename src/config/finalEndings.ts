import type { EndingCgKey, EndingType, GalleryId } from '../types/game';

export interface FinalEndingDefinition {
  id: string;
  endingType: EndingType;
  title: string;
  subtitle: string;
  narrative: string;
  galleryId: GalleryId;
  endingCgKey: EndingCgKey;
}

export const FINAL_ENDINGS: Record<EndingType, FinalEndingDefinition> = {
  S: {
    id: 'butterfly',
    endingType: 'S',
    title: '化茧为蝶',
    subtitle: '终章高光结局',
    narrative:
      '从最初的起点到最终的舞台，她一次次被推到更亮的灯光下，也一次次接住了那些期待。所有训练、压力、应援、沉默和高光，终于在这一刻汇成了完整的蜕变。',
    galleryId: 'ending_butterfly',
    endingCgKey: 'ending_butterfly',
  },
  A: {
    id: 'spark',
    endingType: 'A',
    title: '星火将燃：蝶翼未满',
    subtitle: '高位未满结局',
    narrative:
      '她已经点燃了足够明亮的火光，也几乎触碰到完整蜕变的边缘。只是最后一段路仍有遗憾，但星火已经燃起，蝶翼也已经展开了一半。',
    galleryId: 'ending_spark',
    endingCgKey: 'ending_spark',
  },
  B: {
    id: 'halfway',
    endingType: 'B',
    title: '仍在半山：烙印未成',
    subtitle: '稳定成长结局',
    narrative:
      '她确实走了很远。那些被记住的舞台、稳定下来的粉丝、一次次向前的排名，都证明这不是一段空白旅程。只是距离真正留下不可替代的烙印，还差最后一次突破。',
    galleryId: 'ending_halfway',
    endingCgKey: 'ending_halfway',
  },
  C: {
    id: 'goodnight',
    endingType: 'C',
    title: '那么，晚安：应援断层',
    subtitle: '未成闭环结局',
    narrative:
      '这一路并不是没有光，只是那些光没有汇成足够稳定的方向。有人短暂地看见她，也有人在中途离开。舞台落幕后，声音慢慢散去。',
    galleryId: 'ending_goodnight',
    endingCgKey: 'ending_goodnight',
  },
  Risk: {
    id: 'risk_pause',
    endingType: 'Risk',
    title: '暂停休整',
    subtitle: '风险优先结局',
    narrative:
      '她不是没有努力，只是一路撑到最后时，身体、情绪和粉丝盘都已经发出了太多警讯。暂停不是失败，而是为了让她还能在未来重新站回灯光下。',
    galleryId: 'ending_risk_pause',
    endingCgKey: 'ending_risk_pause',
  },
};
