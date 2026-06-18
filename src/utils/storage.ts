import type { GalleryId, GameSnapshot } from '../types/game';

export const STORAGE_KEYS = {
  gameSnapshot: 'yang-xiaota-idol-demo:game-snapshot',
  unlockedGallery: 'yang-xiaota-idol-demo:unlocked-gallery',
} as const;

const isBrowser = () => typeof window !== 'undefined' && Boolean(window.localStorage);

export function loadGameSnapshot(): GameSnapshot | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEYS.gameSnapshot);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as GameSnapshot;
  } catch {
    return null;
  }
}

export function saveGameSnapshot(snapshot: GameSnapshot): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.gameSnapshot, JSON.stringify(snapshot));
}

export function clearGameSnapshot(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEYS.gameSnapshot);
}

export function loadUnlockedGallery(): GalleryId[] {
  if (!isBrowser()) {
    return ['base'];
  }

  const raw = window.localStorage.getItem(STORAGE_KEYS.unlockedGallery);
  if (!raw) {
    return ['base'];
  }

  try {
    const parsed = JSON.parse(raw) as GalleryId[];
    return parsed.includes('base') ? parsed : ['base', ...parsed];
  } catch {
    return ['base'];
  }
}

export function saveUnlockedGallery(ids: GalleryId[]): void {
  if (!isBrowser()) {
    return;
  }

  const uniqueIds = Array.from(new Set<GalleryId>(['base', ...ids]));
  window.localStorage.setItem(STORAGE_KEYS.unlockedGallery, JSON.stringify(uniqueIds));
}
