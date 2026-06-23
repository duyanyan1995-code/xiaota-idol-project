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
  StatChange,
  PlanId,
  RandomEventChoice,
  RandomEventConfig,
} from './types/game';
import type { CountSummaryItem, FlowPanelState } from './types/flow';
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
import { runAutoAdvanceStep, mergeStatChanges } from './utils/autoAdvanceLogic';
import { shouldPauseForEvent, shouldUseModalForEvent } from './utils/flowImportance';
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
  const [flowPanel, setFlowPanel] = useState<FlowPanelState | null>(null);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
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
    setFlowPanel(null);
    setIsAutoAdvancing(false);
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
    setFlowPanel(null);
    setIsAutoAdvancing(false);
    setGalleryUnlockId(null);
    setQueuedGalleryUnlocks([]);
    setPage(snapshot.state.phase === 'finalEnding' ? 'ending' : 'game');
  }

  function handleAdvancePhase() {
    if (!gameState || pendingEvent) {
      return;
    }

    setFlowPanel(null);
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
      setFlowPanel(null);
      return;
    }

    const eventPick = pickMonthlyEvent(snapshot.state);
    const nextEvent = eventPick.type === 'event' ? eventPick.event : null;
    commitSnapshot(snapshot, nextEvent, false);
    setFlowPanel({
      type: 'inlineActionResult',
      continueLabel: '继续',
      summary: {
        kind: 'manual',
        title: '本月行动完成',
        actionFeedback: snapshot.lastResult,
        changes: snapshot.lastResult?.changes ?? [],
      },
    });
  }

  function handleEventChoice(choice: RandomEventChoice) {
    if (!gameState || !pendingEvent) {
      return;
    }

    const snapshot = applyEventChoice(gameState, pendingEvent, choice);
    const showFeedback = shouldUseModalForEvent(pendingEvent);

    commitSnapshot(snapshot, null, showFeedback);
    setFlowPanel(null);
  }

  function handleContinueFlow() {
    if (!gameState || !flowPanel || isAutoAdvancing) {
      return;
    }

    if (flowPanel.type === 'inlineActionResult') {
      handleInlineActionContinue();
      return;
    }

    setFlowPanel(null);
  }

  function handleInlineActionContinue() {
    if (!gameState || gameState.phase !== 'monthlyEvent') {
      setFlowPanel(null);
      return;
    }

    const actionFeedback = flowPanel?.summary.actionFeedback ?? lastResult;

    if (pendingEvent) {
      if (shouldPauseForEvent(pendingEvent, gameState)) {
        setFlowPanel(null);
        return;
      }

      const snapshot = applyEventChoice(gameState, pendingEvent, pendingEvent.choices[0]);
      commitSnapshot(snapshot, null, false);
      setFlowPanel({
        type: 'inlineEventSummary',
        continueLabel: '进入下个月',
        summary: {
          kind: 'manual',
          title: '本月小插曲',
          eventFeedback: snapshot.lastResult,
          changes: mergeStatChanges(actionFeedback?.changes, snapshot.lastResult?.changes),
        },
      });
      return;
    }

    const snapshot = resolveNoEventAfterPlan(gameState);
    commitSnapshot(
      {
        ...snapshot,
        lastPlanId,
        lastResult: actionFeedback,
      },
      null,
      false,
    );
    setFlowPanel({
      type: 'inlineEventSummary',
      continueLabel: '进入下个月',
      summary: {
        kind: 'manual',
        title: '本月平稳度过',
        noEventText: '这个月平稳度过，小獭稳稳地完成了自己的节奏。',
        changes: actionFeedback?.changes ?? [],
      },
    });
  }

  function handleResolveNode() {
    if (!gameState || pendingEvent) {
      return;
    }

    if (gameState.phase === 'b50') {
      setFlowPanel(null);
      commitSnapshot(resolveB50Node(gameState), null, true);
      return;
    }

    if (gameState.phase === 'election') {
      setFlowPanel(null);
      commitSnapshot(resolveElectionNode(gameState), null, true);
    }
  }

  async function handleAutoAdvance() {
    if (!gameState || pendingEvent || isAutoAdvancing) {
      return;
    }

    setIsAutoAdvancing(true);
    setActiveFeedback(null);
    setFlowPanel(null);

    const actionCounts = new Map<string, number>();
    const eventCounts = new Map<string, number>();
    let totalChanges: StatChange[] = [];
    let monthCount = 0;
    let snapshot: GameSnapshot = {
      state: gameState,
      lastPlanId,
      lastResult,
      pendingEventId: null,
    };
    let nextPendingEvent: RandomEventConfig | null = null;
    let stopReason = '当前阶段需要手动处理';

    for (let index = 0; index < 80; index += 1) {
      const result = runAutoAdvanceStep(snapshot.state);
      snapshot = result.snapshot;
      nextPendingEvent = result.pendingEvent;

      if (result.step) {
        if (result.step.actionLabel) {
          incrementCount(actionCounts, result.step.actionLabel);
        }

        if (result.step.eventLabel) {
          incrementCount(eventCounts, result.step.eventLabel);
        }

        if (result.step.completedMonth || (result.type === 'stopped' && result.step.actionLabel)) {
          monthCount += 1;
        }

        totalChanges = mergeStatChanges(totalChanges, result.step.changes);
        commitSnapshot(snapshot, nextPendingEvent, false);
        setFlowPanel({
          type: 'autoAdvancing',
          summary: {
            kind: 'auto',
            title: `正在推进：${formatYearMonth(result.step.currentYear, result.step.currentMonth)}`,
            subtitle: '普通月份会自动继续，遇到关键节点会停下。',
            actionFeedback: result.step.actionFeedback,
            eventFeedback: result.step.eventFeedback,
            noEventText: result.step.noEventText,
            importantEvent: result.step.importantEvent ?? null,
            changes: result.step.changes,
          },
        });
        await wait(560);
      }

      if (result.type === 'stopped') {
        stopReason = result.stopReason ?? stopReason;
        break;
      }
    }

    setIsAutoAdvancing(false);
    commitSnapshot(snapshot, nextPendingEvent, false);
    setFlowPanel({
      type: 'autoAdvanceSummary',
      continueLabel: '继续',
      summary: {
        kind: 'auto',
        title: '自动推进摘要',
        subtitle: `推进了 ${monthCount} 个月`,
        monthCount,
        actionCounts: toCountItems(actionCounts),
        eventCounts: toCountItems(eventCounts),
        changes: totalChanges,
        stopReason,
        importantEvent: nextPendingEvent
          ? {
              id: nextPendingEvent.id,
              title: nextPendingEvent.title,
              description: nextPendingEvent.description,
            }
          : null,
      },
    });
  }

  function goHome() {
    setPendingEvent(null);
    setFlowPanel(null);
    setIsAutoAdvancing(false);
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
          flowPanel={flowPanel}
          isAutoAdvancing={isAutoAdvancing}
          pendingEvent={pendingEvent}
          onAdvancePhase={handleAdvancePhase}
          onPlan={handlePlan}
          onAutoAdvance={handleAutoAdvance}
          onEventChoice={handleEventChoice}
          onResolveNode={handleResolveNode}
          onCloseFeedback={() => setActiveFeedback(null)}
          onContinueFlow={handleContinueFlow}
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
              年度总结会记录这一年的路线。当前 V4 Phase 3 会在 2025 年 12 月后停在 2026 终章占位，
              正式最终总选、FLAME 舞台和结局判定将在后续 Phase 接入。
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

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function incrementCount(map: Map<string, number>, label: string): void {
  map.set(label, (map.get(label) ?? 0) + 1);
}

function toCountItems(map: Map<string, number>): CountSummaryItem[] {
  return Array.from(map.entries()).map(([label, count]) => ({
    label,
    count,
  }));
}

export default App;
