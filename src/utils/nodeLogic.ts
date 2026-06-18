import type { B50Result, ElectionResult, GameState, NodeGrade, ScoreModifier, StatDeltas } from '../types/game';

const B50_GRADE_TEXT: Record<NodeGrade, string> = {
  S: '传世名场面',
  A: '高光曲目',
  B: '代表舞台',
  C: '有记忆点',
  D: '入围边缘',
  E: '未入围',
};

const ELECTION_GRADE_TEXT: Record<NodeGrade, string> = {
  S: '顶点候补',
  A: '神七级',
  B: '高位圈',
  C: '中位圈',
  D: '初入榜',
  E: '圈外',
};

const B50_REWARDS: Record<NodeGrade, StatDeltas> = {
  S: { fans: 260, popularity: 8, resources: 12, mood: 8 },
  A: { fans: 190, popularity: 6, resources: 8, mood: 5 },
  B: { fans: 130, popularity: 4, resources: 5, mood: 3 },
  C: { fans: 80, popularity: 2, resources: 3 },
  D: { fans: 40, resources: 1 },
  E: { mood: -3, stress: 3 },
};

const ELECTION_REWARDS: Record<NodeGrade, StatDeltas> = {
  S: { fans: 360, popularity: 10, resources: 14, fanLoyalty: 6, mood: 8 },
  A: { fans: 260, popularity: 7, resources: 10, fanLoyalty: 4, mood: 5 },
  B: { fans: 180, popularity: 5, resources: 6, fanLoyalty: 3, mood: 3 },
  C: { fans: 110, popularity: 3, resources: 3, fanLoyalty: 2 },
  D: { fans: 55, popularity: 1, fanLoyalty: 1 },
  E: { mood: -4, stress: 4 },
};

export function calculateB50Result(state: GameState): B50Result {
  const eventBonus = getEventBonus(state, 'b50Bonus');
  const modifiers = getB50Modifiers(state);
  const modifierTotal = sumModifiers(modifiers);
  const rawScore =
    state.performance * 0.35 +
    state.vocal * 0.2 +
    state.dance * 0.2 +
    state.fanLoyalty * 0.15 +
    state.popularity * 0.1 +
    eventBonus +
    modifierTotal;
  const score = clamp(Math.round(rawScore), 0, 100);
  const grade = getGrade(score);

  return {
    id: `b50-${state.year}`,
    year: state.year,
    currentYear: state.currentYear,
    currentMonth: state.currentMonth,
    score,
    grade,
    gradeText: B50_GRADE_TEXT[grade],
    eventBonus,
    modifiers,
    rewards: B50_REWARDS[grade],
    message: `${state.currentYear} 年的舞台记忆节点获得 ${grade} 级：${B50_GRADE_TEXT[grade]}。`,
  };
}

export function calculateElectionResult(state: GameState): ElectionResult {
  const eventBonus = getEventBonus(state, 'electionBonus');
  const modifiers = getElectionModifiers(state);
  const modifierTotal = sumModifiers(modifiers);
  const fansNormalized = clamp(state.fans / 60, 0, 100);
  const rawScore =
    fansNormalized * 0.3 +
    state.fanLoyalty * 0.25 +
    state.popularity * 0.2 +
    state.charm * 0.15 +
    state.resources * 0.1 +
    eventBonus +
    modifierTotal;
  const score = clamp(Math.round(rawScore), 0, 100);
  const grade = getGrade(score);

  return {
    id: `election-${state.year}`,
    year: state.year,
    currentYear: state.currentYear,
    currentMonth: state.currentMonth,
    score,
    grade,
    gradeText: ELECTION_GRADE_TEXT[grade],
    eventBonus,
    modifiers,
    rewards: ELECTION_REWARDS[grade],
    message: `${state.currentYear} 年的年度人气节点获得 ${grade} 级：${ELECTION_GRADE_TEXT[grade]}。`,
  };
}

function getB50Modifiers(state: GameState): ScoreModifier[] {
  return [
    state.energy < 30 ? { label: '体力不足', value: -8 } : null,
    state.mood < 40 ? { label: '心情低落', value: -5 } : null,
    state.stress >= 70 ? { label: '压力过高', value: -8 } : null,
    state.mood >= 80 ? { label: '心情高涨', value: 5 } : null,
    state.fanLoyalty >= 70 ? { label: '粉丝应援', value: 5 } : null,
  ].filter(Boolean) as ScoreModifier[];
}

function getElectionModifiers(state: GameState): ScoreModifier[] {
  return [
    state.mood >= 80 ? { label: '状态闪亮', value: 5 } : null,
    state.stress >= 70 ? { label: '压力过高', value: -5 } : null,
    state.fanLoyalty >= 80 ? { label: '长期陪伴', value: 8 } : null,
  ].filter(Boolean) as ScoreModifier[];
}

function getEventBonus(
  state: GameState,
  key: 'b50Bonus' | 'electionBonus',
): number {
  return state.eventHistory
    .filter((event) => event.currentYear === state.currentYear)
    .reduce((total, event) => total + event[key], 0);
}

function getGrade(score: number): NodeGrade {
  if (score >= 90) {
    return 'S';
  }

  if (score >= 75) {
    return 'A';
  }

  if (score >= 60) {
    return 'B';
  }

  if (score >= 45) {
    return 'C';
  }

  if (score >= 30) {
    return 'D';
  }

  return 'E';
}

function sumModifiers(modifiers: ScoreModifier[]): number {
  return modifiers.reduce((total, modifier) => total + modifier.value, 0);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
