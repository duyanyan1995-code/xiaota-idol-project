import type { B50Tier, ElectionTier, PlanId } from '../types/game';

export type CareerStageId = 'rookie' | 'growth' | 'core' | 'mature';

export type ElectionThresholds = Record<Exclude<ElectionTier, 'outside'>, number>;
export type B50Thresholds = Record<Exclude<B50Tier, 'notRanked'>, number>;

export interface HighTierRequirement {
  minFans: number;
  minFanLoyalty: number;
  minPopularity?: number;
  minPerformance?: number;
  minPositiveEvents: number;
  maxNegativeEvents: number;
  minPlanCounts?: Partial<Record<PlanId, number>>;
}

export interface RankCalibrationStage {
  id: CareerStageId;
  name: string;
  years: number[];
  electionScoreMultiplier: number;
  b50ScoreMultiplier: number;
  electionScoreCap: number;
  b50ScoreCap: number;
  maxElectionTier: ElectionTier;
  maxB50Tier: B50Tier;
  electionThresholds: ElectionThresholds;
  b50Thresholds: B50Thresholds;
  kami7Requires?: HighTierRequirement;
  centerRequires?: HighTierRequirement;
  highlightRequires?: HighTierRequirement;
  legendRequires?: HighTierRequirement;
  simulationTarget: string;
}

export const RANK_CALIBRATION_STAGES: RankCalibrationStage[] = [
  {
    id: 'rookie',
    name: '新人期',
    years: [2015, 2016],
    electionScoreMultiplier: 0.78,
    b50ScoreMultiplier: 0.78,
    electionScoreCap: 64,
    b50ScoreCap: 66,
    maxElectionTier: 'top32',
    maxB50Tier: 'middle',
    electionThresholds: {
      top48: 36,
      top32: 56,
      top16: 78,
      kami7: 90,
      center: 98,
    },
    b50Thresholds: {
      ranked: 38,
      middle: 58,
      high: 78,
      highlight: 90,
      legend: 98,
    },
    simulationTarget: '前期进圈困难，TOP48 就是明显阶段胜利。',
  },
  {
    id: 'growth',
    name: '成长期',
    years: [2017, 2018, 2019],
    electionScoreMultiplier: 0.92,
    b50ScoreMultiplier: 0.92,
    electionScoreCap: 78,
    b50ScoreCap: 80,
    maxElectionTier: 'top16',
    maxB50Tier: 'high',
    electionThresholds: {
      top48: 34,
      top32: 50,
      top16: 68,
      kami7: 84,
      center: 95,
    },
    b50Thresholds: {
      ranked: 34,
      middle: 50,
      high: 68,
      highlight: 84,
      legend: 95,
    },
    simulationTarget: '中期稳定进圈，好路线可以冲 TOP32 / TOP16 边缘。',
  },
  {
    id: 'core',
    name: '核心期',
    years: [2020, 2021, 2022],
    electionScoreMultiplier: 1,
    b50ScoreMultiplier: 1,
    electionScoreCap: 88,
    b50ScoreCap: 88,
    maxElectionTier: 'kami7',
    maxB50Tier: 'highlight',
    electionThresholds: {
      top48: 32,
      top32: 48,
      top16: 64,
      kami7: 82,
      center: 94,
    },
    b50Thresholds: {
      ranked: 32,
      middle: 48,
      high: 64,
      highlight: 78,
      legend: 94,
    },
    kami7Requires: {
      minFans: 3800,
      minFanLoyalty: 68,
      minPopularity: 64,
      minPositiveEvents: 1,
      maxNegativeEvents: 2,
    },
    highlightRequires: {
      minFans: 2800,
      minFanLoyalty: 64,
      minPerformance: 72,
      minPositiveEvents: 0,
      maxNegativeEvents: 99,
      minPlanCounts: {
        stageFocus: 2,
      },
    },
    simulationTarget: '核心期经营合理可以进 TOP16，极好路线摸到神七或名场面边缘。',
  },
  {
    id: 'mature',
    name: '成熟期',
    years: [2023, 2024, 2025],
    electionScoreMultiplier: 1.06,
    b50ScoreMultiplier: 1.06,
    electionScoreCap: 100,
    b50ScoreCap: 100,
    maxElectionTier: 'center',
    maxB50Tier: 'legend',
    electionThresholds: {
      top48: 30,
      top32: 46,
      top16: 62,
      kami7: 78,
      center: 92,
    },
    b50Thresholds: {
      ranked: 30,
      middle: 46,
      high: 62,
      highlight: 74,
      legend: 92,
    },
    kami7Requires: {
      minFans: 4300,
      minFanLoyalty: 72,
      minPopularity: 70,
      minPositiveEvents: 1,
      maxNegativeEvents: 2,
    },
    centerRequires: {
      minFans: 6800,
      minFanLoyalty: 84,
      minPopularity: 84,
      minPositiveEvents: 1,
      maxNegativeEvents: 1,
      minPlanCounts: {
        fanService: 2,
        outsideExposure: 1,
        imageBuilding: 1,
      },
    },
    highlightRequires: {
      minFans: 3000,
      minFanLoyalty: 70,
      minPerformance: 78,
      minPositiveEvents: 0,
      maxNegativeEvents: 99,
      minPlanCounts: {
        stageFocus: 2,
      },
    },
    legendRequires: {
      minFans: 5200,
      minFanLoyalty: 78,
      minPerformance: 90,
      minPositiveEvents: 1,
      maxNegativeEvents: 1,
      minPlanCounts: {
        stageFocus: 3,
        theaterTraining: 2,
      },
    },
    simulationTarget: '成熟期好路线能冲神七 / 名场面，顶点和年度舞台记忆必须满足额外条件。',
  },
];

export function getRankCalibrationStage(currentYear: number): RankCalibrationStage {
  return (
    RANK_CALIBRATION_STAGES.find((stage) => stage.years.includes(currentYear)) ??
    RANK_CALIBRATION_STAGES[RANK_CALIBRATION_STAGES.length - 1]
  );
}
