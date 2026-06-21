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
