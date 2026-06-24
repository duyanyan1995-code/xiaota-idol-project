import {
  B50_TIER_NARRATIVES,
  ELECTION_TIER_NARRATIVES,
} from '../config/annualResults';
import type { GameFeedback, NodeGrade, NodeResult } from '../types/game';

const ELECTION_GRADE_LABELS: Record<NodeGrade, string> = {
  S: '顶点',
  A: '神七',
  B: 'TOP16',
  C: 'TOP32',
  D: 'TOP48',
  E: '圈外',
};

const B50_GRADE_LABELS: Record<NodeGrade, string> = {
  S: '年度舞台记忆',
  A: '名场面',
  B: '高位曲',
  C: '中位圈',
  D: '入围',
  E: '未入围',
};

export function getNodeResultLabel(
  result: NodeResult | null | undefined,
  nodeType: 'election' | 'b50',
  fallbackGrade?: NodeGrade,
): string {
  if (result?.rankLabel) {
    return result.rankLabel;
  }

  if (result?.gradeText) {
    return result.gradeText;
  }

  const grade = result?.grade ?? fallbackGrade;
  if (!grade) {
    return '未结算';
  }

  return nodeType === 'election'
    ? ELECTION_GRADE_LABELS[grade]
    : B50_GRADE_LABELS[grade];
}

export function getFeedbackNodeResultLabel(feedback: GameFeedback): string | null {
  const detailLabel = feedback.details
    ?.find((detail) => detail.startsWith('档位 '))
    ?.replace('档位 ', '');

  if (detailLabel) {
    return detailLabel;
  }

  if (!feedback.grade) {
    return null;
  }

  if (feedback.title.includes('B50')) {
    return B50_GRADE_LABELS[feedback.grade];
  }

  if (feedback.title.includes('总选')) {
    return ELECTION_GRADE_LABELS[feedback.grade];
  }

  return null;
}

export function getFeedbackNodeDisplayLabel(feedback: GameFeedback): string | null {
  const rawLabel = getFeedbackNodeResultLabel(feedback);

  if (feedback.title.includes('B50')) {
    return normalizeB50Label(rawLabel, feedback.grade);
  }

  if (feedback.title.includes('总选') || feedback.title.includes('年度人气')) {
    return normalizeElectionLabel(rawLabel, feedback.grade);
  }

  return null;
}

export function getFeedbackNodeStory(feedback: GameFeedback): string | null {
  const label = getFeedbackNodeDisplayLabel(feedback);

  if (!label) {
    return null;
  }

  if (feedback.title.includes('B50')) {
    return getB50StoryByDisplayLabel(label);
  }

  if (feedback.title.includes('总选') || feedback.title.includes('年度人气')) {
    return getElectionStoryByDisplayLabel(label);
  }

  return null;
}

function normalizeElectionLabel(
  rawLabel: string | null,
  fallbackGrade?: NodeGrade,
): string | null {
  const normalized = rawLabel?.replace(/\s+/g, '').toUpperCase();

  if (normalized === '顶点' || normalized === '第1' || normalized === 'CENTER') {
    return '第1';
  }

  if (normalized === 'TOP3') {
    return 'Top3';
  }

  if (rawLabel === '神七' || normalized === 'KAMI7') {
    return '神七';
  }

  if (normalized === 'TOP16') {
    return 'Top16';
  }

  if (normalized === 'TOP32') {
    return 'Top32';
  }

  if (normalized === 'TOP48') {
    return 'Top48';
  }

  if (rawLabel === '入围') {
    return '入围';
  }

  if (rawLabel === '圈外') {
    return '圈外';
  }

  if (!fallbackGrade) {
    return null;
  }

  const gradeFallback: Record<NodeGrade, string> = {
    S: '第1',
    A: '神七',
    B: 'Top16',
    C: 'Top32',
    D: 'Top48',
    E: '圈外',
  };

  return gradeFallback[fallbackGrade];
}

function normalizeB50Label(rawLabel: string | null, fallbackGrade?: NodeGrade): string | null {
  if (rawLabel === '年度舞台记忆') {
    return '年度高光';
  }

  if (rawLabel === '名场面') {
    return 'Top3';
  }

  if (rawLabel === '高位曲') {
    return 'Top16';
  }

  if (rawLabel === '中位圈' || rawLabel === '入围') {
    return '入围';
  }

  if (rawLabel === '未入围') {
    return '未入围';
  }

  if (!fallbackGrade) {
    return null;
  }

  const gradeFallback: Record<NodeGrade, string> = {
    S: '年度高光',
    A: 'Top3',
    B: 'Top16',
    C: '入围',
    D: '入围',
    E: '未入围',
  };

  return gradeFallback[fallbackGrade];
}

function getElectionStoryByDisplayLabel(label: string): string | null {
  const storyByLabel: Record<string, string> = {
    圈外: ELECTION_TIER_NARRATIVES.outside,
    入围: ELECTION_TIER_NARRATIVES.ranked,
    Top48: ELECTION_TIER_NARRATIVES.top48,
    Top32: ELECTION_TIER_NARRATIVES.top32,
    Top16: ELECTION_TIER_NARRATIVES.top16,
    神七: ELECTION_TIER_NARRATIVES.kami7,
    Top3: ELECTION_TIER_NARRATIVES.top3,
    第1: ELECTION_TIER_NARRATIVES.center,
  };

  return storyByLabel[label] ?? null;
}

function getB50StoryByDisplayLabel(label: string): string | null {
  const storyByLabel: Record<string, string> = {
    未入围: B50_TIER_NARRATIVES.notRanked,
    入围: B50_TIER_NARRATIVES.ranked,
    Top16: B50_TIER_NARRATIVES.high,
    Top3: B50_TIER_NARRATIVES.highlight,
    年度高光: B50_TIER_NARRATIVES.legend,
  };

  return storyByLabel[label] ?? null;
}
