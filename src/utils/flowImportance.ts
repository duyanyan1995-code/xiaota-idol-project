import type { GameState, RandomEventConfig } from '../types/game';

export function shouldPauseForEvent(event: RandomEventConfig, state: GameState): boolean {
  return Boolean(event || getCriticalGameStateReason(state));
}

export function shouldUseModalForEvent(event: RandomEventConfig): boolean {
  return Boolean(
    event.rarity === 'superRare' ||
      event.galleryId ||
      event.eventCgKey ||
      (event.rarity === 'rare' && event.tone === 'negative') ||
      event.requiresAttention ||
      event.shouldPause,
  );
}

export function getEventPauseReason(event: RandomEventConfig, state: GameState): string {
  const crisisReason = getCriticalGameStateReason(state);
  if (crisisReason) {
    return crisisReason;
  }

  if (event.eventCgKey || event.galleryId) {
    return `重要事件：${event.title}`;
  }

  if (event.type === 'risk') {
    return `风险事件：${event.title}`;
  }

  if (event.type === 'milestone') {
    return `里程碑事件：${event.title}`;
  }

  if (event.rarity === 'superRare') {
    return `超稀有事件：${event.title}`;
  }

  if (event.rarity === 'rare' && event.tone === 'negative') {
    return `需要处理的危机：${event.title}`;
  }

  return `需要停顿：${event.title}`;
}

export function getCriticalGameStateReason(state: GameState): string | null {
  if (state.stamina <= 20) {
    return '体力危机，需要停下来照顾小獭';
  }

  if (state.pressure >= 80) {
    return '压力过高，需要停下来调整节奏';
  }

  if (state.fanFatigue >= 70) {
    return '粉丝疲劳过高，需要修复应援节奏';
  }

  if (state.mood <= 25) {
    return '心情低落，需要停下来照顾状态';
  }

  return null;
}
