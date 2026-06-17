import { useEffect, useMemo, useState } from 'react';
import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { GalleryPage } from './pages/GalleryPage';
import { EndingPage } from './pages/EndingPage';
import type {
  ActionId,
  CharacterImageKey,
  GameFeedback,
  GameState,
  RandomEventChoice,
  RandomEventConfig,
} from './types/game';
import {
  applyEventChoice,
  createInitialGameState,
  getEndingForState,
  mergeUnlockedGallery,
  normalizeGameSnapshot,
  performAction,
  rollRandomEvent,
  sameGalleryIds,
} from './utils/gameLogic';
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
  const [lastActionId, setLastActionId] = useState<ActionId | null>(null);
  const [lastResult, setLastResult] = useState<GameFeedback | null>(null);
  const [pendingEvent, setPendingEvent] = useState<RandomEventConfig | null>(null);
  const [unlockedGallery, setUnlockedGallery] = useState<CharacterImageKey[]>(() =>
    loadUnlockedGallery(),
  );
  const [hasSave, setHasSave] = useState(() => Boolean(loadGameSnapshot()));
  const [showGuide, setShowGuide] = useState(false);

  const ending = useMemo(
    () => (gameState ? getEndingForState(gameState) : null),
    [gameState],
  );

  useEffect(() => {
    if (!gameState) {
      return;
    }

    saveGameSnapshot({
      state: gameState,
      lastActionId,
      lastResult,
    });
    setHasSave(true);

    const nextUnlocked = mergeUnlockedGallery(gameState, unlockedGallery);
    if (!sameGalleryIds(nextUnlocked, unlockedGallery)) {
      setUnlockedGallery(nextUnlocked);
      saveUnlockedGallery(nextUnlocked);
    }
  }, [gameState, lastActionId, lastResult, unlockedGallery]);

  function startNewGame() {
    const nextState = createInitialGameState();
    clearGameSnapshot();
    setGameState(nextState);
    setLastActionId(null);
    setLastResult(null);
    setPendingEvent(null);
    setPage('game');
  }

  function continueGame() {
    const snapshot = normalizeGameSnapshot(loadGameSnapshot());
    if (!snapshot) {
      return;
    }

    setGameState(snapshot.state);
    setLastActionId(snapshot.lastActionId);
    setLastResult(snapshot.lastResult);
    setPendingEvent(null);
    setPage(snapshot.state.day > 30 ? 'ending' : 'game');
  }

  function handleAction(actionId: ActionId) {
    if (!gameState || pendingEvent) {
      return;
    }

    const snapshot = performAction(gameState, actionId);
    setGameState(snapshot.state);
    setLastActionId(snapshot.lastActionId);
    setLastResult(snapshot.lastResult);

    if (snapshot.state.day > 30) {
      setPendingEvent(null);
      setPage('ending');
      return;
    }

    setPendingEvent(rollRandomEvent());
  }

  function handleEventChoice(choice: RandomEventChoice) {
    if (!gameState || !pendingEvent) {
      return;
    }

    const snapshot = applyEventChoice(gameState, pendingEvent, choice);
    setGameState(snapshot.state);
    setLastActionId(snapshot.lastActionId);
    setLastResult(snapshot.lastResult);
    setPendingEvent(null);
  }

  function goHome() {
    setPendingEvent(null);
    setPage('home');
  }

  return (
    <>
      {page === 'home' ? (
        <HomePage
          hasSave={hasSave}
          onStart={startNewGame}
          onContinue={continueGame}
          onOpenGallery={() => setPage('gallery')}
          onOpenGuide={() => setShowGuide(true)}
        />
      ) : null}

      {page === 'game' && gameState ? (
        <GamePage
          state={gameState}
          lastActionId={lastActionId}
          lastResult={lastResult}
          pendingEvent={pendingEvent}
          onAction={handleAction}
          onEventChoice={handleEventChoice}
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
            <h2 id="guide-title">30 天养成挑战</h2>
            <p>
              每天选择一次行动。训练提升唱功、舞蹈和魅力，营业增加人气与粉丝，休息恢复状态。第
              30 天之后会根据最终属性进入阶段结局。
            </p>
            <button className="button button--primary" type="button" onClick={() => setShowGuide(false)}>
              知道了
            </button>
          </section>
        </div>
      ) : null}
    </>
  );
}

export default App;

