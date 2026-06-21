import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const cache = new Map();

const strategies = {
  stage: {
    name: '舞台路线',
    actions: ['specialIntensiveTraining', 'stageFocus', 'theaterTraining', 'stageFocus', 'restAndReflect'],
  },
  fan: {
    name: '粉丝路线',
    actions: ['specialBirthdaySupport', 'fanService', 'fanService', 'outsideExposure', 'stableOperation'],
  },
  outside: {
    name: '外务路线',
    actions: ['specialSoloWork', 'outsideExposure', 'imageBuilding', 'outsideExposure', 'restAndReflect'],
  },
  stable: {
    name: '稳定路线',
    actions: ['stableOperation', 'restAndReflect', 'stableOperation', 'fanService', 'restAndReflect'],
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

function choosePlan(state, strategy, modules, index) {
  const { PLAN_BY_ID } = modules.plans;
  const { isPlanUnlocked } = modules.unlockLogic;
  const desired = strategy.actions[index % strategy.actions.length];
  const candidates = [
    desired,
    ...strategy.actions,
    'stableOperation',
    'restAndReflect',
    'fanService',
    'theaterTraining',
  ];
  const uniqueCandidates = Array.from(new Set(candidates));

  return uniqueCandidates.find((planId) => isPlanUnlocked(PLAN_BY_ID[planId], state)) ?? 'stableOperation';
}

function chooseEventChoice(event, strategyId) {
  const priorities = {
    stage: ['performance', 'dance', 'vocal', 'fanLoyalty', 'fans'],
    fan: ['fans', 'fanLoyalty', 'popularity', 'charm', 'mood'],
    outside: ['popularity', 'charm', 'fans', 'style'],
    stable: ['energy', 'mood', 'stress', 'fanLoyalty'],
  }[strategyId];

  return event.choices
    .map((choice) => ({
      choice,
      score: Object.entries(choice.effects).reduce((total, [key, value]) => {
        const delta = value ?? 0;
        const direction = key === 'stress' ? -1 : 1;
        const weight = priorities.includes(key) ? 3 : 1;
        return total + delta * direction * weight;
      }, 0),
    }))
    .sort((a, b) => b.score - a.score)[0].choice;
}

function runStrategy(strategyId, seed) {
  Math.random = createSeededRandom(seed);
  const modules = {
    gameLogic: loadModule('src/utils/gameLogic.ts'),
    eventLogic: loadModule('src/utils/eventLogic.ts'),
    routeLogic: loadModule('src/utils/routeLogic.ts'),
    unlockLogic: loadModule('src/utils/unlockLogic.ts'),
    plans: loadModule('src/config/plans.ts'),
  };
  const strategy = strategies[strategyId];
  let snapshot = {
    state: modules.gameLogic.createInitialGameState(),
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
    specialActions: 0,
  };
  const seenSummaries = new Set();

  for (let step = 0; step < 1400; step += 1) {
    const state = snapshot.state;

    if (state.phase === 'finalEnding') {
      break;
    }

    if (state.phase === 'monthStart') {
      snapshot = modules.gameLogic.advancePhase(state);
      continue;
    }

    if (state.phase === 'monthlyPlan') {
      const planId = choosePlan(state, strategy, modules, actionIndex);
      actionIndex += 1;
      snapshot = modules.gameLogic.applyPlan(state, planId);
      counts.actions += 1;
      if (modules.plans.PLAN_BY_ID[planId].isSpecialAction) {
        counts.specialActions += 1;
      }

      if (!modules.gameLogic.isEventPhase(snapshot.state.phase)) {
        pendingEvent = null;
        continue;
      }

      const eventPick = modules.eventLogic.pickMonthlyEvent(snapshot.state);
      if (eventPick.type === 'event') {
        pendingEvent = eventPick.event;
      } else {
        const noEventSnapshot = modules.gameLogic.resolveNoEventAfterPlan(snapshot.state);
        snapshot = {
          ...noEventSnapshot,
          lastPlanId: snapshot.lastPlanId,
          lastResult: snapshot.lastResult,
        };
        pendingEvent = null;
        counts.noEvents += 1;
      }
      continue;
    }

    if (state.phase === 'monthlyEvent') {
      const event = pendingEvent ?? (modules.eventLogic.pickMonthlyEvent(state).event ?? null);
      if (!event) {
        snapshot = modules.gameLogic.resolveNoEventAfterPlan(state);
        pendingEvent = null;
        counts.noEvents += 1;
        continue;
      }

      snapshot = modules.gameLogic.applyEventChoice(state, event, chooseEventChoice(event, strategyId));
      pendingEvent = null;
      counts.eventChoices += 1;
      continue;
    }

    if (state.phase === 'election') {
      snapshot = modules.gameLogic.resolveElectionNode(state);
      counts.elections += 1;
      continue;
    }

    if (state.phase === 'b50') {
      snapshot = modules.gameLogic.resolveB50Node(state);
      counts.b50 += 1;
      continue;
    }

    if (state.phase === 'yearSummary') {
      if (!seenSummaries.has(state.currentYear)) {
        seenSummaries.add(state.currentYear);
        counts.yearSummaries += 1;
      }
      snapshot = modules.gameLogic.advancePhase(state);
    }
  }

  const finalState = snapshot.state;
  const topRoutes = modules.routeLogic.getTopRoutes(finalState, 2);

  return {
    strategy: strategy.name,
    counts,
    finalPhase: finalState.phase,
    topRoutes: topRoutes.map((route) => `${route.label} ${route.score}`),
    electionTiers: finalState.electionResults.map((entry) => entry.rankLabel),
    b50Tiers: finalState.b50Results.map((entry) => entry.rankLabel),
    finalElection: finalState.electionResults.at(-1)?.rankLabel ?? '无',
    finalB50: finalState.b50Results.at(-1)?.rankLabel ?? '无',
    finalStats: {
      fans: finalState.fans,
      fanLoyalty: finalState.fanLoyalty,
      popularity: finalState.popularity,
      performance: finalState.performance,
      stress: finalState.stress,
      energy: finalState.energy,
    },
  };
}

const results = Object.keys(strategies).map((strategyId, index) =>
  runStrategy(strategyId, 20260719 + index * 131),
);

console.log(JSON.stringify(results, null, 2));
