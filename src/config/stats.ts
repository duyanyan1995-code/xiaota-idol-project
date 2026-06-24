import type { StatKey, WorkGrade } from '../types/game';

export type StatCategory = 'status' | 'stage' | 'fan' | 'personal' | 'hidden';

export interface StatConfig {
  id: StatKey;
  statName: string;
  min: number;
  max: number;
  initialValue: number;
  displayInMain: boolean;
  displayInDetail: boolean;
  isNegative: boolean;
  category: StatCategory;
}

export const DEFAULT_WORK_GRADE: WorkGrade = 'C';

export const STAT_CONFIGS: StatConfig[] = [
  {
    id: 'stamina',
    statName: '体力',
    min: 0,
    max: 100,
    initialValue: 80,
    displayInMain: true,
    displayInDetail: true,
    isNegative: false,
    category: 'status',
  },
  {
    id: 'mood',
    statName: '心情',
    min: 0,
    max: 100,
    initialValue: 75,
    displayInMain: true,
    displayInDetail: true,
    isNegative: false,
    category: 'status',
  },
  {
    id: 'pressure',
    statName: '压力',
    min: 0,
    max: 100,
    initialValue: 10,
    displayInMain: true,
    displayInDetail: true,
    isNegative: true,
    category: 'status',
  },
  {
    id: 'vocal',
    statName: '唱功',
    min: 0,
    max: 100,
    initialValue: 12,
    displayInMain: false,
    displayInDetail: true,
    isNegative: false,
    category: 'stage',
  },
  {
    id: 'dance',
    statName: '舞蹈',
    min: 0,
    max: 100,
    initialValue: 16,
    displayInMain: false,
    displayInDetail: true,
    isNegative: false,
    category: 'stage',
  },
  {
    id: 'stagePower',
    statName: '舞台力',
    min: 0,
    max: 100,
    initialValue: 10,
    displayInMain: false,
    displayInDetail: true,
    isNegative: false,
    category: 'stage',
  },
  {
    id: 'fanCount',
    statName: '粉丝数',
    min: 0,
    max: 9999,
    initialValue: 50,
    displayInMain: true,
    displayInDetail: true,
    isNegative: false,
    category: 'fan',
  },
  {
    id: 'supportPower',
    statName: '核心应援力',
    min: 0,
    max: 100,
    initialValue: 5,
    displayInMain: true,
    displayInDetail: true,
    isNegative: false,
    category: 'fan',
  },
  {
    id: 'influence',
    statName: '影响力',
    min: 0,
    max: 100,
    initialValue: 0,
    displayInMain: true,
    displayInDetail: true,
    isNegative: false,
    category: 'fan',
  },
  {
    id: 'resource',
    statName: '资源',
    min: 0,
    max: 100,
    initialValue: 0,
    displayInMain: false,
    displayInDetail: true,
    isNegative: false,
    category: 'fan',
  },
  {
    id: 'charm',
    statName: '魅力',
    min: 0,
    max: 100,
    initialValue: 18,
    displayInMain: false,
    displayInDetail: true,
    isNegative: false,
    category: 'personal',
  },
  {
    id: 'operation',
    statName: '运营力',
    min: 0,
    max: 100,
    initialValue: 3,
    displayInMain: false,
    displayInDetail: true,
    isNegative: false,
    category: 'personal',
  },
  {
    id: 'fanFatigue',
    statName: '粉丝疲劳',
    min: 0,
    max: 100,
    initialValue: 0,
    displayInMain: false,
    displayInDetail: true,
    isNegative: true,
    category: 'hidden',
  },
];

export const STAT_CONFIG_BY_ID: Record<StatKey, StatConfig> = STAT_CONFIGS.reduce(
  (result, config) => ({
    ...result,
    [config.id]: config,
  }),
  {} as Record<StatKey, StatConfig>,
);

export const MAIN_STAT_KEYS = STAT_CONFIGS.filter((stat) => stat.displayInMain).map(
  (stat) => stat.id,
);

export const DETAIL_STAT_GROUPS: { title: string; stats: StatKey[] }[] = [
  { title: '状态', stats: ['stamina', 'mood', 'pressure'] },
  { title: '舞台能力', stats: ['vocal', 'dance', 'stagePower'] },
  { title: '粉丝 / 总选', stats: ['fanCount', 'supportPower', 'influence', 'resource'] },
  { title: '个人经营', stats: ['charm', 'operation'] },
  { title: '隐藏 / 半隐藏', stats: ['fanFatigue'] },
];

export const LEGACY_STAT_KEY_MAP: Record<string, StatKey> = {
  energy: 'stamina',
  stress: 'pressure',
  performance: 'stagePower',
  stagePerformance: 'stagePower',
  popularity: 'influence',
  fanLoyalty: 'supportPower',
  fanStickiness: 'supportPower',
  resources: 'resource',
  fans: 'fanCount',
  fan: 'fanCount',
  style: 'operation',
};

export function toCurrentStatKey(key: string): StatKey | null {
  if (key in STAT_CONFIG_BY_ID) {
    return key as StatKey;
  }

  return LEGACY_STAT_KEY_MAP[key] ?? null;
}

export function getInitialStatValue(key: StatKey): number {
  return STAT_CONFIG_BY_ID[key].initialValue;
}

export function isValidWorkGrade(value: unknown): value is WorkGrade {
  return value === 'C' || value === 'B' || value === 'A' || value === 'S';
}
