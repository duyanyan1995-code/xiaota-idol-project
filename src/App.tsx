import { useEffect, useMemo, useState } from 'react';
import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { GalleryPage } from './pages/GalleryPage';
import { EndingPage } from './pages/EndingPage';
import { AppShell } from './components/AppShell';
import { CharacterDisplay } from './components/CharacterDisplay';
import { GALLERY_ITEMS } from './config/gallery';
import { getVisualAsset } from './config/visualAssets';
import type {
  GameFeedback,
  GameSnapshot,
  GameState,
  GalleryId,
  PlanId,
  RandomEventChoice,
  RandomEventConfig,
} from './types/game';
import {
  advancePhase,
  applyEventChoice,
  applyPlan,
  createInitialGameState,
  isEventPhase,
  mergeUnlockedGallery,
  normalizeGameSnapshot,
  resolveNoEventAfterPlan,
  resolveB50Node,
  resolveElectionNode,
  sameGalleryIds,
} from './utils/gameLogic';
import { getEventById, pickMonthlyEvent } from './utils/eventLogic';
import { getEndingForState } from './utils/endingLogic';
import { formatYearMonth } from './utils/dateDisplay';
import {
  clearGameSnapshot,
  loadGameSnapshot,
  loadUnlockedGallery,
  saveGameSnapshot,
  saveUnlockedGallery,
} from './utils/storage';

type PageName = 'home' | 'game' | 'gallery' | 'ending';

function App() {
  const [page, setPage] = useState<PageName>('home');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [lastPlanId, setLastPlanId] = useState<PlanId | null>(null);
  const [lastResult, setLastResult] = useState<GameFeedback | null>(null);
  const [pendingEvent, setPendingEvent] = useState<RandomEventConfig | null>(null);
  const [activeFeedback, setActiveFeedback] = useState<GameFeedback | null>(null);
  const [galleryUnlockId, setGalleryUnlockId] = useState<GalleryId | null>(null);
  const [queuedGalleryUnlocks, setQueuedGalleryUnlocks] = useState<GalleryId[]>([]);
  const [unlockedGallery, setUnlockedGallery] = useState<GalleryId[]>(() =>
    loadUnlockedGallery(),
  );
  const [savedSnapshot, setSavedSnapshot] = useState<GameSnapshot | null>(() =>
    loadNormalizedSnapshot(),
  );
  const [showGuide, setShowGuide] = useState(false);

  const ending = useMemo(
    () => (gameState ? getEndingForState(gameState) : null),
    [gameState],
  );

  useEffect(() => {
    if (!gameState) {
      return;
    }

    const nextUnlocked = mergeUnlockedGallery(gameState, unlockedGallery);
    const stateForSave: GameState = {
      ...gameState,
      unlockedGallery: nextUnlocked,
    };
    const snapshotForSave: GameSnapshot = {
      state: stateForSave,
      lastPlanId,
      lastResult,
      pendingEventId: pendingEvent?.id ?? null,
    };

    saveGameSnapshot(snapshotForSave);
    setSavedSnapshot(snapshotForSave);

    if (!sameGalleryIds(nextUnlocked, unlockedGallery)) {
      const newUnlocks = nextUnlocked.filter(
        (id) => id !== 'base' && !unlockedGallery.includes(id),
      );
      if (newUnlocks.length > 0) {
        setQueuedGalleryUnlocks((current) =>
          Array.from(new Set<GalleryId>([...current, ...newUnlocks])),
        );
      }
      setUnlockedGallery(nextUnlocked);
      saveUnlockedGallery(nextUnlocked);
    }
  }, [gameState, lastPlanId, lastResult, pendingEvent, unlockedGallery]);

  useEffect(() => {
    if (activeFeedback || galleryUnlockId || queuedGalleryUnlocks.length === 0) {
      return;
    }

    const [nextUnlock, ...restUnlocks] = queuedGalleryUnlocks;
    setGalleryUnlockId(nextUnlock);
    setQueuedGalleryUnlocks(restUnlocks);
  }, [activeFeedback, galleryUnlockId, queuedGalleryUnlocks]);

  function startNewGame() {
    const nextState: GameState = {
      ...createInitialGameState(),
      unlockedGallery,
    };
    clearGameSnapshot();
    setGameState(nextState);
    setLastPlanId(null);
    setLastResult(null);
    setPendingEvent(null);
    setActiveFeedback(null);
    setGalleryUnlockId(null);
    setQueuedGalleryUnlocks([]);
    setPage('game');
  }

  function continueGame() {
    const snapshot = loadNormalizedSnapshot();
    if (!snapshot) {
      clearGameSnapshot();
      setSavedSnapshot(null);
      return;
    }

    setGameState(snapshot.state);
    setLastPlanId(snapshot.lastPlanId);
    setLastResult(snapshot.lastResult);
    setPendingEvent(resolvePendingEvent(snapshot));
    setActiveFeedback(null);
    setGalleryUnlockId(null);
    setQueuedGalleryUnlocks([]);
    setPage(snapshot.state.phase === 'finalEnding' ? 'ending' : 'game');
  }

  function handleAdvancePhase() {
    if (!gameState || pendingEvent) {
      return;
    }

    const snapshot = advancePhase(gameState);
    commitSnapshot(snapshot, null, false);
  }

  function handlePlan(planId: PlanId) {
    if (!gameState || pendingEvent) {
      return;
    }

    const snapshot = applyPlan(gameState, planId);
    if (!isEventPhase(snapshot.state.phase)) {
      commitSnapshot(snapshot, null, true);
      return;
    }

    const eventPick = pickMonthlyEvent(snapshot.state);
    if (eventPick.type === 'event') {
      commitSnapshot(snapshot, eventPick.event, true);
      return;
    }

    const noEventSnapshot = resolveNoEventAfterPlan(snapshot.state);
    commitSnapshot(
      {
        ...noEventSnapshot,
        lastPlanId: snapshot.lastPlanId,
        lastResult: snapshot.lastResult,
      },
      null,
      true,
    );
  }

  function handleEventChoice(choice: RandomEventChoice) {
    if (!gameState || !pendingEvent) {
      return;
    }

    const snapshot = applyEventChoice(gameState, pendingEvent, choice);
    commitSnapshot(snapshot, null, true);
  }

  function handleResolveNode() {
    if (!gameState || pendingEvent) {
      return;
    }

    if (gameState.phase === 'b50') {
      commitSnapshot(resolveB50Node(gameState), null, true);
      return;
    }

    if (gameState.phase === 'election') {
      commitSnapshot(resolveElectionNode(gameState), null, true);
    }
  }

  function goHome() {
    setPendingEvent(null);
    setPage('home');
  }

  function commitSnapshot(
    snapshot: GameSnapshot,
    event: RandomEventConfig | null,
    showFeedback: boolean,
  ) {
    setGameState(snapshot.state);
    setLastPlanId(snapshot.lastPlanId);
    setLastResult(snapshot.lastResult);
    setPendingEvent(event);
    setActiveFeedback(showFeedback ? snapshot.lastResult : null);

    if (snapshot.state.phase === 'finalEnding') {
      setPage('ending');
    } else {
      setPage('game');
    }
  }

  return (
    <AppShell>
      {page === 'home' ? (
        <HomePage
          hasSave={Boolean(savedSnapshot)}
          savedProgress={
            savedSnapshot
              ? formatYearMonth(savedSnapshot.state.currentYear, savedSnapshot.state.currentMonth)
              : null
          }
          onStart={startNewGame}
          onContinue={continueGame}
          onOpenGallery={() => setPage('gallery')}
          onOpenGuide={() => setShowGuide(true)}
        />
      ) : null}

      {page === 'game' && gameState ? (
        <GamePage
          state={gameState}
          lastPlanId={lastPlanId}
          lastResult={lastResult}
          activeFeedback={activeFeedback}
          pendingEvent={pendingEvent}
          onAdvancePhase={handleAdvancePhase}
          onPlan={handlePlan}
          onEventChoice={handleEventChoice}
          onResolveNode={handleResolveNode}
          onCloseFeedback={() => setActiveFeedback(null)}
          onHome={goHome}
          onRestart={startNewGame}
        />
      ) : null}

      {page === 'gallery' ? (
        <GalleryPage unlockedIds={unlockedGallery} onHome={goHome} />
      ) : null}

      {page === 'ending' && gameState && ending ? (
        <EndingPage
          ending={ending}
          state={gameState}
          unlockedCount={unlockedGallery.length}
          onHome={goHome}
          onRestart={startNewGame}
          onGallery={() => setPage('gallery')}
        />
      ) : null}

      {showGuide ? (
        <div className="modal-backdrop" role="presentation">
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-title"
          >
            <p className="eyebrow">玩法说明</p>
            <h2 id="guide-title">11 年偶像生涯</h2>
            <p>
              从 2015 年 1 月开始，每个月安排一次行动、处理一次事件，并在配置月份结算总选或 B50。
              年度总结会记录这一年的路线，完成 2025 年 12 月后进入终章结算。
            </p>
            <button className="button button--primary" type="button" onClick={() => setShowGuide(false)}>
              知道了
            </button>
          </section>
        </div>
      ) : null}

      {galleryUnlockId ? (
        <GalleryUnlockModal imageId={galleryUnlockId} onClose={() => setGalleryUnlockId(null)} />
      ) : null}
    </AppShell>
  );
}

function GalleryUnlockModal({
  imageId,
  onClose,
}: {
  imageId: GalleryId;
  onClose: () => void;
}) {
  const item = GALLERY_ITEMS.find((entry) => entry.id === imageId);
  if (!item) {
    return null;
  }
  const categoryLabel =
    item.category === 'ending' ? '结局 CG 解锁' : item.category === 'event' ? '事件 CG 解锁' : '图鉴解锁';
  const unlockMessage =
    item.category === 'ending' ? `${item.name} 已加入结局相册。` : item.description;

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card result-modal" role="dialog" aria-modal="true">
        <p className="eyebrow">{categoryLabel}</p>
        <CharacterDisplay image={getVisualAsset(item.visual.type, item.visual.key)} compact />
        <h2>{item.name}</h2>
        <p>{unlockMessage}</p>
        <button className="button button--primary" type="button" onClick={onClose}>
          收下
        </button>
      </section>
    </div>
  );
}

function loadNormalizedSnapshot(): GameSnapshot | null {
  return normalizeGameSnapshot(loadGameSnapshot());
}

function resolvePendingEvent(snapshot: GameSnapshot): RandomEventConfig | null {
  const storedEvent = getEventById(snapshot.pendingEventId);
  if (storedEvent) {
    return storedEvent;
  }

  if (isEventPhase(snapshot.state.phase)) {
    const eventPick = pickMonthlyEvent(snapshot.state);
    return eventPick.type === 'event' ? eventPick.event : getEventById('dailyMoment');
  }

  return null;
}

export default App;
