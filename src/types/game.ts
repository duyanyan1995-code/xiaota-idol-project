export type GamePhase =
  | 'yearStart'
  | 'firstHalfPlan'
  | 'firstHalfEvent'
  | 'election'
  | 'secondHalfPlan'
  | 'secondHalfEvent'
  | 'b50'
  | 'yearSummary'
  | 'finalEnding';

export type HalfYear = 'first' | 'second';

export type GrowthStat =
  | 'vocal'
  | 'dance'
  | 'performance'
  | 'charm'
  | 'popularity'
  | 'fanLoyalty'
  | 'resources'
  | 'style';

export type ConditionStat = 'energy' | 'mood' | 'stress';

export type ResourceStat = 'fans';

export type StatKey = GrowthStat | ConditionStat | ResourceStat;

export type PlanId =
  | 'theaterTraining'
  | 'fanService'
  | 'outsideExposure'
  | 'stageFocus'
  | 'imageBuilding'
  | 'restAndReflect'
  | 'stableOperation';

export type CharacterImageKey =
  | 'base'
  | 'happy'
  | 'tired'
  | 'wink'
  | 'stage'
  | 'practice'
  | 'summer';

export type ActionVisualKey =
  | 'theaterTrainingAction'
  | 'fanServiceAction'
  | 'outsideExposureAction'
  | 'stageFocusAction'
  | 'imageBuildingAction'
  | 'restAndReflectAction'
  | 'stableOperationAction';

export type EventCgKey =
  | 'fanLetterCg'
  | 'fanCreationCg'
  | 'stageMistakeCg'
  | 'extraPracticeCg'
  | 'styleChallengeCg'
  | 'summerInviteCg'
  | 'lowMoodCg'
  | 'secretHappyCg'
  | 'dailyMomentCg';

export type GalleryId = CharacterImageKey | EventCgKey;

export type VisualAssetKey = CharacterImageKey | ActionVisualKey | EventCgKey;

export type FeedbackVisual =
  | {
      type: 'actionVisual';
      key: ActionVisualKey;
    }
  | {
      type: 'eventCg';
      key: EventCgKey;
    }
  | {
      type: 'legacy';
      key: CharacterImageKey;
    };

export type NodeGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'E';

export type GameStatus = 'playing' | 'completed';

export type StatDeltas = Partial<Record<StatKey, number>>;

export interface EventFlags {
  [key: string]: boolean;
}

export interface PlanConfig {
  id: PlanId;
  name: string;
  description: string;
  actionVisualKey: ActionVisualKey;
  effects: StatDeltas;
  riskTags: string[];
  feedbackText: string;
}

export interface PlanHistoryEntry {
  id: string;
  year: number;
  half: HalfYear;
  planId: PlanId;
  planName: string;
  actionVisualKey?: ActionVisualKey;
  feedbackText: string;
  effects: StatDeltas;
}

export interface RandomEventChoice {
  id: string;
  label: string;
  resultText: string;
  effects: StatDeltas;
  flags?: EventFlags;
  b50Bonus?: number;
  electionBonus?: number;
}

export interface RandomEventConfig {
  id: string;
  title: string;
  description: string;
  eventCgKey: EventCgKey;
  galleryId?: GalleryId;
  choices: RandomEventChoice[];
  weight?: number;
  triggerCondition?: (state: GameState, half: HalfYear) => boolean;
}

export interface EventHistoryEntry {
  id: string;
  year: number;
  half: HalfYear;
  eventId: string;
  eventTitle: string;
  choiceId: string;
  choiceLabel: string;
  resultText: string;
  eventCgKey?: EventCgKey;
  galleryId?: GalleryId;
  effects: StatDeltas;
  b50Bonus: number;
  electionBonus: number;
}

export interface ScoreModifier {
  label: string;
  value: number;
}

export interface NodeResult {
  id: string;
  year: number;
  score: number;
  grade: NodeGrade;
  gradeText: string;
  eventBonus: number;
  modifiers: ScoreModifier[];
  rewards: StatDeltas;
  message: string;
}

export type B50Result = NodeResult;

export type ElectionResult = NodeResult;

export interface GrowthLog {
  id: string;
  year: number;
  phase: GamePhase;
  title: string;
  description: string;
  deltas: StatDeltas;
}

export interface YearSummary {
  id: string;
  year: number;
  careerStage: string;
  firstPlanName: string;
  secondPlanName: string;
  b50Grade: NodeGrade;
  b50Score: number;
  electionGrade: NodeGrade;
  electionScore: number;
  eventTitles: string[];
  growthSummary: StatChange[];
  routeHint: string;
}

export interface GameState {
  saveVersion: 3;
  year: number;
  phase: GamePhase;
  vocal: number;
  dance: number;
  performance: number;
  charm: number;
  popularity: number;
  fans: number;
  fanLoyalty: number;
  resources: number;
  style: number;
  energy: number;
  mood: number;
  stress: number;
  planHistory: PlanHistoryEntry[];
  eventHistory: EventHistoryEntry[];
  b50Results: B50Result[];
  electionResults: ElectionResult[];
  yearSummaries: YearSummary[];
  growthLogs: GrowthLog[];
  unlockedGallery: GalleryId[];
  eventFlags: EventFlags;
  gameStatus: GameStatus;
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
  grade?: NodeGrade;
  visual?: FeedbackVisual;
  imageKey?: CharacterImageKey;
  changes: StatChange[];
  details?: string[];
}

export interface GalleryItem {
  id: GalleryId;
  name: string;
  visual: Extract<FeedbackVisual, { type: 'legacy' | 'eventCg' }>;
  description: string;
  conditionText: string;
  isUnlocked: (state: GameState) => boolean;
}

export interface EndingConfig {
  id: string;
  name: string;
  routeTag: string;
  text: string;
  finalLine: string;
  isMatched: (state: GameState) => boolean;
}

export interface CharacterImage {
  key: VisualAssetKey;
  src: string;
  plannedSrc?: string;
  alt: string;
  label: string;
}

export interface GameSnapshot {
  state: GameState;
  lastPlanId: PlanId | null;
  lastResult: GameFeedback | null;
  pendingEventId?: string | null;
}
