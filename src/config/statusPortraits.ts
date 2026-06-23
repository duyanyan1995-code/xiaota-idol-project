import { publicPath } from './publicPath';

export type StatusPortraitKey = 'normal' | 'happy' | 'tired' | 'stressed';

const STATUS_PORTRAIT_VERSION = '20260623_status_fix';

export interface StatusPortraitAsset {
  key: StatusPortraitKey;
  src: string;
  alt: string;
  label: string;
  placeholderText: string;
}

export const STATUS_PORTRAITS: Record<StatusPortraitKey, StatusPortraitAsset> = {
  normal: makeStatusPortrait('normal', '普通状态立绘'),
  happy: makeStatusPortrait('happy', '开心状态立绘'),
  tired: makeStatusPortrait('tired', '疲惫状态立绘'),
  stressed: makeStatusPortrait('stressed', '高压状态立绘'),
};

function makeStatusPortrait(key: StatusPortraitKey, label: string): StatusPortraitAsset {
  return {
    key,
    src: publicPath(`assets/status/${key}.png?v=${STATUS_PORTRAIT_VERSION}`),
    alt: label,
    label,
    placeholderText: label,
  };
}
