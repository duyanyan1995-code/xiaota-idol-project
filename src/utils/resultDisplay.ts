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

const ELECTION_STORY_TEXT: Record<string, string> = {
  圈外: '这一年的支持还没有汇聚成足够大的声量。小獭仍在积累自己的基本盘，也在等待下一次被更多人看见的机会。',
  入围: '这一年，更多人开始记住她的名字。虽然还不是最耀眼的位置，但每一份支持都在慢慢把她往前推。',
  Top48: '她第一次站进了更大的名单里。粉丝的声音被听见了，而她也开始意识到，自己正在被更多人认真期待。',
  Top32: '这一年的努力有了更稳定的回应。粉丝盘开始成形，她不再只是被偶然看见，而是被持续记住。',
  Top16: '她走进了更核心的位置。灯光更亮，压力也更近，但属于她的名字已经开始有了重量。',
  神七: '她站到了真正的高位。欢呼声变得更近，期待也变得更重，这一年会成为粉丝和她都记得的节点。',
  Top3: '离最高处只差一步。她已经证明自己能站在风暴中心，接下来要面对的，是更强的期待和更真实的压力。',
  第1: '这一刻，所有长期的陪伴、应援和等待终于汇成了名字前的第一位。她站上了最高处，也接住了属于自己的光。',
};

const B50_STORY_TEXT: Record<string, string> = {
  未入围: '这一年的舞台记忆还没有抵达足够多人心里。她仍在积累经验，也在等待下一次真正被舞台记住的机会。',
  入围: '今年的舞台留下了一点回声。也许还不够响亮，但已经有人愿意为这一刻投下记忆。',
  Top16: '她的舞台开始被更多人反复提起。那些训练、走位和眼神，终于在某一首歌里留下了痕迹。',
  Top3: '这一年的舞台成为了重要记忆。粉丝记住的不只是名次，还有她在灯光下真正撑住的一瞬间。',
  年度高光: '这一场舞台成为了年度记忆点。不是短暂的热闹，而是会被反复想起、反复提到的高光时刻。',
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
    return B50_STORY_TEXT[label] ?? null;
  }

  if (feedback.title.includes('总选') || feedback.title.includes('年度人气')) {
    return ELECTION_STORY_TEXT[label] ?? null;
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
