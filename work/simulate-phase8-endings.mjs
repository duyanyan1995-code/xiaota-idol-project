import { createServer } from 'vite';

const RUNS = [
  ['random', 100],
  ['stage', 50],
  ['fan', 50],
  ['stable', 50],
  ['pressure', 20],
  ['ideal', 20],
];

const server = await createServer({
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true },
});

try {
  const gameLogic = await server.ssrLoadModule('/src/utils/gameLogic.ts');
  const planConfig = await server.ssrLoadModule('/src/config/plans.ts');

  const results = {};
  for (const [strategy, count] of RUNS) {
    results[strategy] = simulateBatch(strategy, count, gameLogic, planConfig.PLAN_BY_ID);
  }
  results.coverageProbes = {
    lowGrowthC: findEndingCoverage('lowGrowth', 'C', 40, gameLogic, planConfig.PLAN_BY_ID),
    idealS: findEndingCoverage('ideal', 'S', 40, gameLogic, planConfig.PLAN_BY_ID),
    pressureRisk: findEndingCoverage('pressure', 'Risk', 5, gameLogic, planConfig.PLAN_BY_ID),
  };

  console.log(JSON.stringify(results, null, 2));
} finally {
  await server.close();
}

function simulateBatch(strategy, count, gameLogic, planById) {
  const distribution = {
    endings: {},
    flame: {},
    finalElection: {},
    riskReasons: {},
    completed: 0,
  };

  for (let index = 0; index < count; index += 1) {
    const finalState = simulateRun(strategy, gameLogic, planById);
    const endingType = finalState.endingResult?.endingType ?? 'none';
    const flameGrade = finalState.workResults.find((result) => result.workId === 'flame')?.grade ?? 'none';
    const finalElection = finalState.finalElectionResult?.resultLabel ?? 'none';

    add(distribution.endings, endingType);
    add(distribution.flame, flameGrade);
    add(distribution.finalElection, finalElection);
    if (endingType === 'Risk') {
      const reason = finalState.endingResult?.keyReasons?.[0] ?? '未记录';
      add(distribution.riskReasons, reason);
    }
    if (finalState.isGameCompleted) {
      distribution.completed += 1;
    }
  }

  return distribution;
}

function simulateRun(strategy, gameLogic, planById) {
  let snapshot = {
    state: gameLogic.createInitialGameState(),
    lastPlanId: null,
    lastResult: null,
    pendingEventId: null,
  };

  for (let guard = 0; guard < 900; guard += 1) {
    let state = snapshot.state;
    if (state.phase === 'finalEnding') {
      return state;
    }

    if (state.pendingVisualUnlock) {
      snapshot = gameLogic.advancePhase(state);
      continue;
    }

    if (state.phase === 'monthStart' || state.phase === 'flamePrelude' || state.phase === 'yearSummary') {
      snapshot = gameLogic.advancePhase(state);
      continue;
    }

    state = snapshot.state;
    if (state.phase === 'monthlyPlan') {
      const planId = choosePlan(state, strategy, planById);
      snapshot = gameLogic.applyPlan(state, planId);
      continue;
    }

    state = snapshot.state;
    if (state.phase === 'monthlyEvent') {
      snapshot = gameLogic.resolveNoEventAfterPlan(state);
      continue;
    }

    state = snapshot.state;
    if (state.phase === 'election') {
      snapshot = gameLogic.resolveElectionNode(state);
      continue;
    }

    if (state.phase === 'b50') {
      snapshot = gameLogic.resolveB50Node(state);
      continue;
    }

    if (state.phase === 'themeNode' || state.phase === 'workNode') {
      snapshot = gameLogic.advancePhase(state);
      continue;
    }

    if (state.phase === 'finalElection') {
      snapshot = gameLogic.resolveFinalElectionNode(state);
      continue;
    }
  }

  return snapshot.state;
}

function choosePlan(state, strategy, planById) {
  const options = state.monthlyActionOptions.map((option) => option.planId);
  const priority = getStrategyPriority(state, strategy);
  const preferred = priority.find((planId) => options.includes(planId) && planById[planId]);
  return preferred ?? options[0] ?? 'stableOperation';
}

function getStrategyPriority(state, strategy) {
  if (strategy === 'lowGrowth') {
    return ['restAndReflect', 'stableOperation', 'fanService'];
  }

  if (strategy === 'random') {
    return shuffle([
      'stableOperation',
      'fanService',
      'outsideExposure',
      'theaterTraining',
      'stageFocus',
      'imageBuilding',
      'restAndReflect',
    ]);
  }

  if (strategy === 'stage') {
    return state.stamina < 28 || state.pressure > 78
      ? ['restAndReflect', 'stableOperation', 'stageFocus', 'theaterTraining']
      : ['stageFocus', 'theaterTraining', 'imageBuilding', 'stableOperation', 'fanService'];
  }

  if (strategy === 'fan') {
    return state.stamina < 25 || state.pressure > 80
      ? ['restAndReflect', 'stableOperation', 'fanService']
      : ['fanService', 'outsideExposure', 'imageBuilding', 'stableOperation', 'stageFocus'];
  }

  if (strategy === 'stable') {
    return state.stamina < 45 || state.pressure > 65
      ? ['restAndReflect', 'stableOperation', 'fanService']
      : ['stableOperation', 'fanService', 'stageFocus', 'imageBuilding'];
  }

  if (strategy === 'pressure') {
    return ['stageFocus', 'theaterTraining', 'outsideExposure', 'fanService', 'imageBuilding'];
  }

  return state.stamina < 42 || state.pressure > 70
    ? ['restAndReflect', 'stableOperation', 'fanService']
    : ['stageFocus', 'fanService', 'outsideExposure', 'imageBuilding', 'theaterTraining', 'stableOperation'];
}

function add(target, key) {
  target[key] = (target[key] ?? 0) + 1;
}

function summarizeSingleRun(finalState) {
  return {
    ending: finalState.endingResult?.endingType ?? 'none',
    endingTitle: finalState.endingResult?.title ?? 'none',
    flame: finalState.workResults.find((result) => result.workId === 'flame')?.grade ?? 'none',
    finalElection: finalState.finalElectionResult?.resultLabel ?? 'none',
    asWorks: finalState.workResults.filter((result) => result.grade === 'A' || result.grade === 'S').length,
    completed: finalState.isGameCompleted,
  };
}

function findEndingCoverage(strategy, targetEnding, attempts, gameLogic, planById) {
  let fallback = null;
  for (let index = 0; index < attempts; index += 1) {
    const finalState = simulateRun(strategy, gameLogic, planById);
    const summary = summarizeSingleRun(finalState);
    fallback = summary;
    if (summary.ending === targetEnding) {
      return {
        found: true,
        attempts: index + 1,
        ...summary,
      };
    }
  }

  return {
    found: false,
    attempts,
    ...fallback,
  };
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}
