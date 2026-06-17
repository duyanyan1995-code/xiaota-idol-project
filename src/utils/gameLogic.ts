import { ACTIONS } from '../config/actions';
import { CHARACTER_IMAGES } from '../config/characterImages';
import { ENDINGS, FALLBACK_ENDING } from '../config/endings';
import { RANDOM_EVENT_CHANCE, RANDOM_EVENTS } from '../config/events';
import { GALLERY_ITEMS } from '../config/gallery';
import type {
  ActionCounters,
  ActionId,
  CharacterImage,
  CharacterImageKey,
  GameFeedback,
  GameSnapshot,
  GameState,
  RandomEventChoice,
  RandomEventConfig,
  StatChange,
  StatDeltas,
  StatKey,
} from '../types/game';

const BOUNDED_STATS = ['energy', 'mood', 'vocal', 'dance', 'charm', 'popularity'] as const;
const RESOURCE_STATS = ['fans', 'coins'] as const;

const STAT_LABELS: Record<StatKey, string> = {
  day: '天数',
  energy: '体力',
  mood: '心情',
  vocal: '唱功',
  dance: '舞蹈',
  charm: '魅力',
  popularity: '人气',
  fans: '粉丝数',
  coins: '金币',
};

export function createInitialGameState(): GameState {
  return {
    day: 1,
    energy: 80,
    mood: 70,
    vocal: 10,
    dance: 10,
    charm: 10,
    popularity: 0,
    fans: 0,
    coins: 100,
    actionCounts: {
      fanServiceCount: 0,
      stageCount: 0,
      trainingCount: 0,
    },
    temporaryState: null,
    summerJoined: false,
  };
}

export function normalizeGameSnapshot(snapshot: GameSnapshot | null): GameSnapshot | null {
  if (!snapshot) {
    return null;
  }

  return {
    state: normalizeGameState(snapshot.state),
    lastActionId: snapshot.lastActionId ?? null,
    lastResult: snapshot.lastResult ?? null,
  };
}

export function normalizeGameState(value: Partial<GameState> | null | undefined): GameState {
  const initial = createInitialGameState();
  const merged = {
    ...initial,
    ...value,
    actionCounts: {
      ...initial.actionCounts,
      ...(value?.actionCounts ?? {}),
    },
    temporaryState: value?.temporaryState ?? null,
    summerJoined: Boolean(value?.summerJoined),
  };

  return clampGameState(merged);
}

export function getCharacterImage(
  gameState: GameState,
  lastActionId: ActionId | null,
): CharacterImage {
  if (gameState.temporaryState === 'summer') {
    return CHARACTER_IMAGES.summer;
  }

  if (gameState.energy < 30) {
    return CHARACTER_IMAGES.tired;
  }

  if (lastActionId === 'fanService') {
    return CHARACTER_IMAGES.wink;
  }

  if (lastActionId === 'stagePerformance') {
    return CHARACTER_IMAGES.stage;
  }

  if (
    lastActionId === 'vocalTraining' ||
    lastActionId === 'danceTraining' ||
    lastActionId === 'expressionPractice'
  ) {
    return CHARACTER_IMAGES.practice;
  }

  if (gameState.mood > 85) {
    return CHARACTER_IMAGES.happy;
  }

  return CHARACTER_IMAGES.base;
}

export function performAction(state: GameState, actionId: ActionId): GameSnapshot {
  const action = ACTIONS.find((item) => item.id === actionId);
  if (!action) {
    throw new Error(`Unknown action: ${actionId}`);
  }

  const before = state;
  const effect = action.getEffect?.(state) ?? {
    deltas: action.deltas ?? {},
    counters: action.counters,
  };

  const stateBeforeDeltas: GameState = {
    ...state,
    temporaryState: null,
  };
  const afterDeltas = applyDeltas(stateBeforeDeltas, effect.deltas);
  const nextState = clampGameState({
    ...afterDeltas,
    day: afterDeltas.day + 1,
    actionCounts: addCounters(afterDeltas.actionCounts, {
      ...action.counters,
      ...effect.counters,
    }),
  });

  return {
    state: nextState,
    lastActionId: actionId,
    lastResult: {
      title: action.name,
      message: action.feedback,
      score: effect.score,
      changes: collectChanges(before, nextState),
    },
  };
}

export function rollRandomEvent(): RandomEventConfig | null {
  if (RANDOM_EVENTS.length === 0 || Math.random() >= RANDOM_EVENT_CHANCE) {
    return null;
  }

  const index = Math.floor(Math.random() * RANDOM_EVENTS.length);
  return RANDOM_EVENTS[index];
}

export function applyEventChoice(
  state: GameState,
  event: RandomEventConfig,
  choice: RandomEventChoice,
): GameSnapshot {
  const before = state;
  const afterDeltas = applyDeltas(state, choice.deltas);
  const nextState = clampGameState({
    ...afterDeltas,
    temporaryState: choice.temporaryState ?? afterDeltas.temporaryState,
    summerJoined: choice.summerJoined ? true : afterDeltas.summerJoined,
  });

  return {
    state: nextState,
    lastActionId: null,
    lastResult: {
      title: event.title,
      message: choice.resultText,
      changes: collectChanges(before, nextState),
    },
  };
}

export function getEndingForState(state: GameState) {
  return ENDINGS.find((ending) => ending.isMatched(state)) ?? FALLBACK_ENDING;
}

export function mergeUnlockedGallery(
  state: GameState,
  currentUnlocked: CharacterImageKey[],
): CharacterImageKey[] {
  const next = new Set<CharacterImageKey>(currentUnlocked);
  GALLERY_ITEMS.forEach((item) => {
    if (item.isUnlocked(state)) {
      next.add(item.id);
    }
  });

  return Array.from(next);
}

export function sameGalleryIds(a: CharacterImageKey[], b: CharacterImageKey[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  const bSet = new Set(b);
  return a.every((item) => bSet.has(item));
}

function applyDeltas(state: GameState, deltas: StatDeltas): GameState {
  const changedValues = Object.entries(deltas).reduce<Partial<GameState>>(
    (result, [key, value]) => {
      if (value === undefined) {
        return result;
      }

      const statKey = key as keyof StatDeltas;
      return {
        ...result,
        [statKey]: state[statKey] + value,
      };
    },
    {},
  );

  return clampGameState({
    ...state,
    ...changedValues,
  });
}

function clampGameState(state: GameState): GameState {
  const next = { ...state };
  BOUNDED_STATS.forEach((key) => {
    next[key] = clamp(Math.round(next[key]), 0, 100);
  });
  RESOURCE_STATS.forEach((key) => {
    next[key] = Math.max(0, Math.round(next[key]));
  });
  next.day = Math.max(1, Math.round(next.day));

  return next;
}

function collectChanges(before: GameState, after: GameState): StatChange[] {
  const keys: StatKey[] = [
    'day',
    'energy',
    'mood',
    'vocal',
    'dance',
    'charm',
    'popularity',
    'fans',
    'coins',
  ];

  return keys
    .filter((key) => before[key] !== after[key])
    .map((key) => ({
      key,
      label: STAT_LABELS[key],
      before: before[key],
      after: after[key],
      delta: after[key] - before[key],
    }));
}

function addCounters(
  current: ActionCounters,
  increments: Partial<ActionCounters> | undefined,
): ActionCounters {
  if (!increments) {
    return current;
  }

  return {
    fanServiceCount: current.fanServiceCount + (increments.fanServiceCount ?? 0),
    stageCount: current.stageCount + (increments.stageCount ?? 0),
    trainingCount: current.trainingCount + (increments.trainingCount ?? 0),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
