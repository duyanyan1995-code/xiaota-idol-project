import { ENDINGS, FALLBACK_ENDING } from '../config/endings';
import type { GameState, NodeResult } from '../types/game';

export function getEndingForState(state: GameState) {
  return ENDINGS.find((ending) => ending.isMatched(state)) ?? FALLBACK_ENDING;
}

export function getHighestResult(results: NodeResult[]): NodeResult | null {
  if (results.length === 0) {
    return null;
  }

  return results.reduce((best, result) => (result.score > best.score ? result : best), results[0]);
}
