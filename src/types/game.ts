export type BoundedStat =
  | 'energy'
  | 'mood'
  | 'vocal'
  | 'dance'
  | 'charm'
  | 'popularity';

export type ResourceStat = 'fans' | 'coins';

export type StatKey = BoundedStat | ResourceStat | 'day';

export type ActionId =
  | 'vocalTraining'
  | 'danceTraining'
  | 'expressionPractice'
  | 'fanService'
  | 'rest'
  | 'stagePerformance';

export type CharacterImageKey =
  | 'base'
  | 'happy'
  | 'tired'
  | 'wink'
  | 'stage'
  | 'practice'
  | 'summer';

export type TemporaryState = 'summer' | null;

export interface ActionCounters {
  fanServiceCount: number;
  stageCount: number;
  trainingCount: number;
}

export interface GameState {
  day: number;
  energy: number;
  mood: number;
  vocal: number;
  dance: number;
  charm: number;
  popularity: number;
  fans: number;
  coins: number;
  actionCounts: ActionCounters;
  temporaryState: TemporaryState;
  summerJoined: boolean;
}

export type StatDeltas = Partial<Record<BoundedStat | ResourceStat, number>>;

export interface ActionEffect {
  deltas: StatDeltas;
  score?: number;
  counters?: Partial<ActionCounters>;
}

export interface ActionConfig {
  id: ActionId;
  name: string;
  shortName: string;
  feedback: string;
  deltas?: StatDeltas;
  counters?: Partial<ActionCounters>;
  getEffect?: (state: GameState) => ActionEffect;
}

export interface StatChange {
  key: StatKey;
  label: string;
  before: number;
  after: number;
  delta: number;
}

export interface GameFeedback {
  title: string;
  message: string;
  score?: number;
  changes: StatChange[];
}

export interface RandomEventChoice {
  id: string;
  label: string;
  resultText: string;
  deltas: StatDeltas;
  temporaryState?: TemporaryState;
  summerJoined?: boolean;
}

export interface RandomEventConfig {
  id: string;
  title: string;
  description: string;
  choices: RandomEventChoice[];
}

export interface GalleryItem {
  id: CharacterImageKey;
  name: string;
  imageKey: CharacterImageKey;
  description: string;
  conditionText: string;
  isUnlocked: (state: GameState) => boolean;
}

export interface EndingConfig {
  id: string;
  name: string;
  text: string;
  isMatched: (state: GameState) => boolean;
}

export interface CharacterImage {
  key: CharacterImageKey;
  src: string;
  alt: string;
  label: string;
}

export interface GameSnapshot {
  state: GameState;
  lastActionId: ActionId | null;
  lastResult: GameFeedback | null;
}

