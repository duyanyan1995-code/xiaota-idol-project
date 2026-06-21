import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const cache = new Map();

const strategies = {
  balanced: {
    name: '平衡路线',
    actions: [
      'theaterTraining',
      'fanService',
      'outsideExposure',
      'stageFocus',
      'imageBuilding',
      'restAndReflect',
      'stableOperation',
    ],
  },
  fan: {
    name: '粉丝路线',
    actions: [
      'fanService',
      'outsideExposure',
      'imageBuilding',
      'fanService',
      'stableOperation',
      'outsideExposure',
    ],
  },
  stage: {
    name: '舞台路线',
    actions: [
      'theaterTraining',
      'stageFocus',
      'stageFocus',
      'theaterTraining',
      'fanService',
      'restAndReflect',
    ],
  },
  stable: {
    name: '休整 / 稳定路线',
    actions: [
      'stableOperation',
      'restAndReflect',
      'stableOperation',
      'fanService',
      'restAndReflect',
      'stableOperation',
    ],
  },
};

function resolveModule(request, parentFile) {
  if (!request.startsWith('.')) {
    return request;
  }

  const base = path.resolve(path.dirname(parentFile), request);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
    path.join(base, 'index.js'),
  ];
  const resolved = candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());

  if (!resolved) {
    throw new Error(`Cannot resolve ${request} from ${parentFile}`);
  }

  return resolved;
}

function loadModule(file) {
  const resolved = path.resolve(root, file);
  if (cache.has(resolved)) {
    return cache.get(resolved).exports;
  }

  const source = fs.readFileSync(resolved, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
    fileName: resolved,
  }).outputText;

  const module = { exports: {} };
  cache.set(resolved, module);

  const localRequire = (request) => {
    const target = resolveModule(request, resolved);
    return target.startsWith('/') ? loadModule(target) : require(target);
  };

  const wrapped = new Function('exports', 'require', 'module', output);
  wrapped(module.exports, localRequire, module);
  return module.exports;
}

function createSeededRandom(seed) {
  let current = seed >>> 0;
  return () => {
    current = (current * 1664525 + 1013904223) >>> 0;
    return current / 4294967296;
  };
}

function chooseEventChoice(event, strategyId) {
  if (strategyId === 'stage') {
    return getBestChoice(event, ['performance', 'dance', 'vocal', 'fanLoyalty', 'fans']);
  }

  if (strategyId === 'fan') {
    return getBestChoice(event, ['fans', 'fanLoyalty', 'popularity', 'charm']);
  }

  if (strategyId === 'stable') {
    return getBestChoice(event, ['energy', 'mood', 'stress']);
  }

  return getBestChoice(event, ['fans', 'fanLoyalty', 'performance', 'popularity', 'energy', 'mood']);
}

function getBestChoice(event, priorityStats) {
  return event.choices
    .map((choice) => ({
      choice,
      score: Object.entries(choice.effects).reduce((total, [key, value]) => {
        const delta = value ?? 0;
        const weight = priorityStats.includes(key) ? 3 : 1;
        const direction = key === 'stress' ? -1 : 1;
        return total + delta * weight * direction;
      }, 0),
    }))
    .sort((a, b) => b.score - a.score)[0].choice;
}

function judgeSimulation(strategyId, result) {
  const hasCenter = result.electionTiers.includes('顶点');
  const hasLegend = result.b50Tiers.includes('年度舞台记忆');
  const lateElection = result.electionTiers.slice(-3);
  const lateB50 = result.b50Tiers.slice(-3);

  if (strategyId === 'balanced') {
    return hasCenter ? '偏易：平衡路线已经登顶' : '基本合理：后期能接近高位但不自动登顶';
  }

  if (strategyId === 'fan') {
    return hasCenter ? '偏易：粉丝路线登顶，需要继续观察' : '基本合理：总选强，B50 不必然最强';
  }

  if (strategyId === 'stage') {
    return hasLegend || lateB50.includes('名场面') ? '基本合理：舞台路线在 B50 有优势' : '偏难：舞台路线后期 B50 爆发不足';
  }

  return lateElection.includes('顶点') || lateB50.includes('年度舞台记忆')
    ? '偏易：稳定路线冲顶过快'
    : '基本合理：状态稳定但高位爆发有限';
}

function runStrategy(strategyId, seed) {
  Math.random = createSeededRandom(seed);
  const gameLogic = loadModule('src/utils/gameLogic.ts');
  const eventLogic = loadModule('src/utils/eventLogic.ts');
  const strategy = strategies[strategyId];
  let snapshot = {
    state: gameLogic.createInitialGameState(),
    lastPlanId: null,
    lastResult: null,
    pendingEventId: null,
  };
  let pendingEvent = null;
  let actionIndex = 0;
  const counts = {
    actions: 0,
    eventChoices: 0,
    noEvents: 0,
    elections: 0,
    b50: 0,
    yearSummaries: 0,
  };
  const seenSummaries = new Set();

  for (let step = 0; step < 1200; step += 1) {
    const state = snapshot.state;

    if (state.phase === 'finalEnding') {
      break;
    }

    if (state.phase === 'monthStart') {
      snapshot = gameLogic.advancePhase(state);
      continue;
    }

    if (state.phase === 'monthlyPlan') {
      const planId = strategy.actions[actionIndex % strategy.actions.length];
      actionIndex += 1;
      const planSnapshot = gameLogic.applyPlan(state, planId);
      counts.actions += 1;

      if (!gameLogic.isEventPhase(planSnapshot.state.phase)) {
        snapshot = planSnapshot;
        pendingEvent = null;
        continue;
      }

      const eventPick = eventLogic.pickMonthlyEvent(planSnapshot.state);
      if (eventPick.type === 'event') {
        snapshot = planSnapshot;
        pendingEvent = eventPick.event;
      } else {
        const noEventSnapshot = gameLogic.resolveNoEventAfterPlan(planSnapshot.state);
        snapshot = {
          ...noEventSnapshot,
          lastPlanId: planSnapshot.lastPlanId,
          lastResult: planSnapshot.lastResult,
        };
        pendingEvent = null;
        counts.noEvents += 1;
      }
      continue;
    }

    if (state.phase === 'monthlyEvent') {
      const event = pendingEvent ?? (eventLogic.pickMonthlyEvent(state).event ?? null);
      if (!event) {
        snapshot = gameLogic.resolveNoEventAfterPlan(state);
        pendingEvent = null;
        counts.noEvents += 1;
        continue;
      }

      snapshot = gameLogic.applyEventChoice(state, event, chooseEventChoice(event, strategyId));
      pendingEvent = null;
      counts.eventChoices += 1;
      continue;
    }

    if (state.phase === 'election') {
      snapshot = gameLogic.resolveElectionNode(state);
      counts.elections += 1;
      continue;
    }

    if (state.phase === 'b50') {
      snapshot = gameLogic.resolveB50Node(state);
      counts.b50 += 1;
      continue;
    }

    if (state.phase === 'yearSummary') {
      if (!seenSummaries.has(state.currentYear)) {
        seenSummaries.add(state.currentYear);
        counts.yearSummaries += 1;
      }
      snapshot = gameLogic.advancePhase(state);
    }
  }

  const finalState = snapshot.state;
  const result = {
    strategy: strategy.name,
    counts,
    finalPhase: finalState.phase,
    electionTiers: finalState.electionResults.map((entry) => entry.rankLabel),
    electionScores: finalState.electionResults.map((entry) => entry.score),
    b50Tiers: finalState.b50Results.map((entry) => entry.rankLabel),
    b50Scores: finalState.b50Results.map((entry) => entry.score),
    finalStats: {
      fans: finalState.fans,
      fanLoyalty: finalState.fanLoyalty,
      popularity: finalState.popularity,
      performance: finalState.performance,
      stress: finalState.stress,
      mood: finalState.mood,
      energy: finalState.energy,
    },
    hasCenter: finalState.electionResults.some((entry) => entry.tier === 'center'),
    hasLegend: finalState.b50Results.some((entry) => entry.tier === 'legend'),
  };

  return {
    ...result,
    judgment: judgeSimulation(strategyId, result),
  };
}

const results = Object.keys(strategies).map((strategyId, index) =>
  runStrategy(strategyId, 20260619 + index * 97),
);

console.log(JSON.stringify(results, null, 2));
