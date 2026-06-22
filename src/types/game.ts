export type GamePhase =
  | 'monthStart'
  | 'monthlyPlan'
  | 'monthlyEvent'
  | 'election'
  | 'b50'
  | 'yearSummary'
  | 'finalEnding';

export type HalfYear = 'first' | 'second';

export type ConditionStat = 'stamina' | 'mood' | 'pressure';

export type StageStat = 'vocal' | 'dance' | 'stagePower';

export type FanStat = 'fanCount' | 'supportPower' | 'influence' | 'resource';

export type PersonalStat = 'charm' | 'operation';

export type HiddenStat = 'fanFatigue';

export type GrowthStat = StageStat | FanStat | PersonalStat | HiddenStat;

export type StatKey = GrowthStat | ConditionStat;

export type WorkGrade = 'C' | 'B' | 'A' | 'S';

export type PlanId =
  | 'theaterTraining'
  | 'fanService'
  | 'outsideExposure'
  | 'stageFocus'
  | 'imageBuilding'
  | 'restAndReflect'
  | 'stableOperation'
  | 'specialSoloWork'
  | 'specialIntensiveTraining'
  | 'specialBirthdaySupport'
  | 'specialStyleShift';

export type ActionPoolId =
  | 'action_theater_training'
  | 'action_fan_service'
  | 'action_media_exposure'
  | 'action_stage_focus'
  | 'action_style_building'
  | 'action_rest_reflect'
  | 'action_steady_operation';

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
  | 'stableOperationAction'
  | 'specialSoloWorkAction'
  | 'specialIntensiveTrainingAction'
  | 'specialBirthdaySupportAction'
  | 'specialStyleShiftAction';

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

export type EndingId =
  | 'idolPeak'
  | 'kamiSeven'
  | 'top16Core'
  | 'theaterLegend'
  | 'stageMemory'
  | 'fanBond'
  | 'outsideBreakthrough'
  | 'steadyOperation'
  | 'regretGraduation';

export type EndingCgKey =
  | 'idolPeakEndingCg'
  | 'kamiSevenEndingCg'
  | 'top16CoreEndingCg'
  | 'theaterLegendEndingCg'
  | 'stageMemoryEndingCg'
  | 'fanBondEndingCg'
  | 'outsideBreakthroughEndingCg'
  | 'steadyOperationEndingCg'
  | 'regretGraduationEndingCg';

export type GalleryId = CharacterImageKey | EventCgKey | EndingCgKey;

export type VisualAssetKey = CharacterImageKey | ActionVisualKey | EventCgKey | EndingCgKey;

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
      type: 'endingCg';
      key: EndingCgKey;
    }
  | {
      type: 'legacy';
      key: CharacterImageKey;
    };

export type NodeGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'E';

export type GameStatus = 'playing' | 'completed';

export type ElectionTier = 'outside' | 'top48' | 'top32' | 'top16' | 'kami7' | 'center';

export type B50Tier = 'notRanked' | 'ranked' | 'middle' | 'high' | 'highlight' | 'legend';

export type NodeTier = ElectionTier | B50Tier;

export type EventRarity = 'common' | 'rare' | 'superRare';

export type EventTone = 'positive' | 'negative' | 'mixed';

export type RouteId = 'stage' | 'fan' | 'outside' | 'style' | 'stable' | 'recovery';

export type StatDeltas = Partial<Record<StatKey, number>>;

export type StatEffectRange = Partial<Record<StatKey, [number, number]>>;

export type PlanUnlockCondition =
  | { type: 'statAtLeast'; stat: StatKey; value: number }
  | { type: 'statAtMost'; stat: StatKey; value: number }
  | { type: 'yearAtLeast'; year: number }
  | { type: 'monthIn'; months: number[] }
  | { type: 'planCountAtLeast'; planId: PlanId; count: number; withinYear?: boolean }
  | { type: 'eventSeen'; eventId: string }
  | { type: 'eventTagSeen'; tag: string; tone?: EventTone }
  | { type: 'electionTierAtLeast'; tier: ElectionTier }
  | { type: 'b50TierAtLeast'; tier: B50Tier }
  | { type: 'routeScoreAtLeast'; route: RouteId; value: number };

export interface EventFlags {
  [key: string]: boolean;
}

export interface PlanConfig {
  id: PlanId;
  actionPoolId?: ActionPoolId;
  name: string;
  description: string;
  actionVisualKey: ActionVisualKey;
  effects: StatDeltas;
  effectsRange: StatEffectRange;
  primaryStats: StatKey[];
  secondaryStats: StatKey[];
  riskTags: string[];
  eventTags: string[];
  routeTags?: RouteId[];
  unlockConditions?: PlanUnlockCondition[];
  unlockConditionMode?: 'all' | 'any';
  lockedReason?: string;
  isSpecialAction?: boolean;
  availableMonths?: number[];
  availableStages?: GamePhase[];
  variantPool?: string[];
  feedbackText: string;
}

export interface MonthlyActionOption {
  id: string;
  year: number;
  currentYear: number;
  currentMonth: number;
  planId: PlanId;
  actionPoolId: ActionPoolId;
  variantText: string;
}

export type ActionPostSummary = Partial<
  Record<'stamina' | 'mood' | 'pressure' | 'fanCount' | 'supportPower' | 'influence', number>
>;

export interface PlanHistoryEntry {
  id: string;
  year: number;
  currentYear: number;
  currentMonth: number;
  half?: HalfYear;
  planId: PlanId;
  actionPoolId?: ActionPoolId;
  planName: string;
  actionVisualKey?: ActionVisualKey;
  variantText?: string;
  feedbackText: string;
  effects: StatDeltas;
  postActionSummary?: ActionPostSummary;
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
  eventCgKey?: EventCgKey;
  galleryId?: GalleryId;
  rarity: EventRarity;
  tone: EventTone;
  triggerTags: string[];
  baseWeight: number;
  choices: RandomEventChoice[];
  weight?: number;
  requiresAttention?: boolean;
  shouldPause?: boolean;
  triggerCondition?: (state: GameState) => boolean;
}

export interface EventHistoryEntry {
  id: string;
  year: number;
  currentYear: number;
  currentMonth: number;
  half?: HalfYear;
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
  currentYear: number;
  currentMonth: number;
  score: number;
  grade: NodeGrade;
  gradeText: string;
  tier?: NodeTier;
  rankLabel?: string;
  eventBonus: number;
  modifiers: ScoreModifier[];
  mainFactors?: string[];
  bonusFactors?: string[];
  penaltyFactors?: string[];
  rewards: StatDeltas;
  message: string;
}

export type B50Result = NodeResult;

export type ElectionResult = NodeResult;

export interface GrowthLog {
  id: string;
  year: number;
  currentYear: number;
  currentMonth: number;
  phase: GamePhase;
  title: string;
  description: string;
  deltas: StatDeltas;
}

export interface YearSummary {
  id: string;
  year: number;
  currentYear: number;
  careerStage: string;
  planNames: string[];
  b50Grade: NodeGrade;
  b50Score: number;
  electionGrade: NodeGrade;
  electionScore: number;
  eventTitles: string[];
  growthSummary: StatChange[];
  routeHint: string;
}

export interface GameState {
  saveVersion: 6;
  year: number;
  currentYear: number;
  currentMonth: number;
  phase: GamePhase;
  stamina: number;
  mood: number;
  pressure: number;
  vocal: number;
  dance: number;
  stagePower: number;
  fanCount: number;
  supportPower: number;
  influence: number;
  resource: number;
  charm: number;
  operation: number;
  fanFatigue: number;
  workGrade: WorkGrade;
  monthlyActionOptions: MonthlyActionOption[];
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
  suppressFallbackVisual?: boolean;
  changes: StatChange[];
  details?: string[];
}

export interface GalleryItem {
  id: GalleryId;
  name: string;
  category: 'character' | 'event' | 'ending';
  visual: Extract<FeedbackVisual, { type: 'legacy' | 'eventCg' | 'endingCg' }>;
  description: string;
  conditionText: string;
  isUnlocked: (state: GameState) => boolean;
}

export interface EndingConfig {
  id: EndingId;
  name: string;
  title: string;
  routeTag: string;
  text: string;
  finalLine: string;
  endingCgKey: EndingCgKey;
  galleryId: GalleryId;
  priority: number;
  isMatched: (state: GameState) => boolean;
}

export interface CharacterImage {
  key: VisualAssetKey;
  src: string;
  plannedSrc?: string;
  alt: string;
  label: string;
  placeholderText?: string;
}

export interface GameSnapshot {
  state: GameState;
  lastPlanId: PlanId | null;
  lastResult: GameFeedback | null;
  pendingEventId?: string | null;
}
