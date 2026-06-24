export type GamePhase =
  | 'monthStart'
  | 'monthlyPlan'
  | 'monthlyEvent'
  | 'themeNode'
  | 'workNode'
  | 'election'
  | 'b50'
  | 'yearSummary'
  | 'flamePrelude'
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

export type ThemeNodeType = 'timeline' | 'performanceWork';

export type ThemeNodeImportance = 'normal' | 'key';

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

export type WorkCgKey =
  | 'girls_revolution'
  | 'yy_ds'
  | 'xiaoyi'
  | 'meteor_stream'
  | 'triones'
  | 'fu'
  | 'super_tata'
  | 'brand_mark'
  | 'flame';

export type AnnualCgKey = 'election_champion' | 'b50_highlight';

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

export type GalleryId = CharacterImageKey | EventCgKey | WorkCgKey | AnnualCgKey | EndingCgKey;

export type VisualAssetKey = CharacterImageKey | ActionVisualKey | EventCgKey | WorkCgKey | AnnualCgKey | EndingCgKey;

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
      type: 'workCg';
      key: WorkCgKey;
    }
  | {
      type: 'annualCg';
      key: AnnualCgKey;
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

export type ElectionTier =
  | 'outside'
  | 'ranked'
  | 'top48'
  | 'top32'
  | 'top16'
  | 'kami7'
  | 'top3'
  | 'center';

export type B50Tier = 'notRanked' | 'ranked' | 'middle' | 'high' | 'highlight' | 'legend';

export type NodeTier = ElectionTier | B50Tier;

export type EventRarity = 'common' | 'rare' | 'superRare';

export type EventTone = 'positive' | 'negative' | 'mixed';

export type EventType = 'positive' | 'negative' | 'risk' | 'recovery' | 'milestone';

export type RiskLevel = 'warning' | 'major';

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
  description?: string;
  resultText: string;
  effects: StatDeltas;
  flags?: EventFlags;
  b50Bonus?: number;
  electionBonus?: number;
  riskLevel?: RiskLevel;
}

export interface RandomEventConfig {
  id: string;
  type: EventType;
  title: string;
  description: string;
  visualKey?: EventCgKey;
  eventCgKey?: EventCgKey;
  galleryId?: GalleryId;
  rarity: EventRarity;
  tone: EventTone;
  triggerTags: string[];
  baseWeight: number;
  choices: RandomEventChoice[];
  weight?: number;
  cooldownMonths?: number;
  actionTypes?: PlanId[];
  stageRange?: [number, number];
  riskKey?: string;
  priority?: number;
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
  eventType?: EventType;
  eventTitle: string;
  choiceId: string;
  choiceLabel: string;
  resultText: string;
  eventCgKey?: EventCgKey;
  galleryId?: GalleryId;
  effects: StatDeltas;
  b50Bonus: number;
  electionBonus: number;
  sourceActionId?: PlanId;
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
  expectedTier?: NodeTier;
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

export type AnnualResultType = 'election' | 'b50';

export interface AnnualResult {
  id: string;
  year: number;
  currentYear: number;
  month: number;
  type: AnnualResultType;
  score: number;
  grade: NodeGrade;
  tier: NodeTier;
  expectedTier?: NodeTier;
  title: string;
  resultLabel: string;
  narrative: string;
  deltas: StatDeltas;
  createdAtMonth: number;
  internalBreakdown?: string[];
}

export interface Milestone {
  id: string;
  year: number;
  currentYear: number;
  type: AnnualResultType;
  title: string;
  description: string;
  sourceResultId: string;
}

export interface ThemeNodeResult {
  id: string;
  year: number;
  currentYear: number;
  month: number;
  nodeId: string;
  title: string;
  nodeType: 'timeline';
  narrative: string;
  deltas: StatDeltas;
  sourceName?: string;
  createdAtMonth: number;
  potentialVisualKey?: GalleryId;
}

export interface WorkResult {
  id: string;
  year: number;
  currentYear: number;
  month: number;
  workId: WorkCgKey;
  title: string;
  theme: string;
  score: number;
  grade: WorkGrade;
  resultLabel: string;
  narrative: string;
  deltas: StatDeltas;
  relatedAnnualResultIds?: string[];
  relatedEventIds?: string[];
  relatedActionSummary?: Record<string, number>;
  potentialVisualKey?: WorkCgKey;
  createdAtMonth: number;
}

export interface WorkMilestone {
  id: string;
  year: number;
  currentYear: number;
  type: 'work';
  title: string;
  description: string;
  sourceWorkResultId: string;
  grade: WorkGrade;
  potentialVisualKey?: WorkCgKey;
}

export type GallerySourceType = 'event' | 'work' | 'annual' | 'ending';

export interface GalleryUnlockRecord {
  id: string;
  galleryId: GalleryId;
  sourceType: GallerySourceType;
  sourceId: string;
  year: number;
  currentYear: number;
  month: number;
  title: string;
  unlockedAtMonth: number;
  grade?: WorkGrade;
  eventChoiceId?: string;
}

export interface VisualUnlock {
  id: string;
  galleryId: GalleryId;
  sourceType: GallerySourceType;
  sourceId: string;
  year: number;
  currentYear: number;
  month: number;
  title: string;
  description: string;
  imagePath: string;
  unlockedAtMonth: number;
  grade?: WorkGrade;
  eventChoiceId?: string;
}

export interface GameState {
  saveVersion: 10;
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
  pendingEventId: string | null;
  monthlyActionOptions: MonthlyActionOption[];
  planHistory: PlanHistoryEntry[];
  eventHistory: EventHistoryEntry[];
  eventCooldowns: Record<string, number>;
  riskWarningCounts: Record<string, number>;
  b50Results: B50Result[];
  electionResults: ElectionResult[];
  annualResults: AnnualResult[];
  milestones: Milestone[];
  themeNodeResults: ThemeNodeResult[];
  workResults: WorkResult[];
  workMilestones: WorkMilestone[];
  pendingThemeNodeResult: ThemeNodeResult | null;
  pendingWorkResult: WorkResult | null;
  unlockedGalleryIds: GalleryId[];
  galleryUnlockHistory: GalleryUnlockRecord[];
  pendingVisualUnlock: VisualUnlock | null;
  seenVisualUnlockIds: GalleryId[];
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
  category: 'character' | 'event' | 'work' | 'annual' | 'ending';
  sourceType?: GallerySourceType;
  sourceId?: string;
  rarity?: 'normal' | 'key' | 'rare';
  enabledInPhase?: 'phase7' | 'phase8';
  sortOrder?: number;
  lockedTitle?: string;
  lockedHint?: string;
  visual: Extract<FeedbackVisual, { type: 'legacy' | 'eventCg' | 'workCg' | 'annualCg' | 'endingCg' }>;
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
