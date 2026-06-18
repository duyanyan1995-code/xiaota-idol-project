import { FALLBACK_EVENT, RANDOM_EVENTS } from '../config/events';
import type { GameState, RandomEventConfig } from '../types/game';

export function getEventById(eventId: string | null | undefined): RandomEventConfig | null {
  if (!eventId) {
    return null;
  }

  if (eventId === FALLBACK_EVENT.id) {
    return FALLBACK_EVENT;
  }

  return RANDOM_EVENTS.find((event) => event.id === eventId) ?? null;
}

export function pickRandomEvent(state: GameState): RandomEventConfig {
  if (state.phase !== 'monthlyEvent') {
    return FALLBACK_EVENT;
  }

  const availableEvents = RANDOM_EVENTS.filter(
    (event) => !event.triggerCondition || event.triggerCondition(state),
  );

  if (availableEvents.length === 0) {
    return FALLBACK_EVENT;
  }

  const index = Math.floor(Math.random() * availableEvents.length);
  return availableEvents[index];
}
