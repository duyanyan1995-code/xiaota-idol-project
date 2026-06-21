import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const cache = new Map();

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

const modules = {
  gameLogic: loadModule('src/utils/gameLogic.ts'),
  endingLogic: loadModule('src/utils/endingLogic.ts'),
};

function makeFinalState(overrides = {}) {
  return {
    ...modules.gameLogic.createInitialGameState(),
    saveVersion: 4,
    year: 11,
    currentYear: 2025,
    currentMonth: 12,
    phase: 'finalEnding',
    gameStatus: 'completed',
    unlockedGallery: ['base'],
    yearSummaries: Array.from({ length: 11 }, (_, index) => ({
      id: `summary-${index + 1}`,
      year: index + 1,
      currentYear: 2015 + index,
      careerStage: '模拟',
      planNames: [],
      b50Grade: 'C',
      b50Score: 0,
      electionGrade: 'C',
      electionScore: 0,
      eventTitles: [],
      growthSummary: [],
      routeHint: '模拟',
    })),
    ...overrides,
  };
}

function makePlanHistory(planId, count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `${planId}-${index + 1}`,
    year: Math.floor(index / 12) + 1,
    currentYear: 2015 + Math.floor(index / 12),
    currentMonth: (index % 12) + 1,
    planId,
    planName: planId,
    feedbackText: '模拟行动',
    effects: {},
  }));
}

function makeEventHistory(eventId, count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `${eventId}-${index + 1}`,
    year: Math.floor(index / 12) + 1,
    currentYear: 2015 + Math.floor(index / 12),
    currentMonth: (index % 12) + 1,
    eventId,
    eventTitle: eventId,
    choiceId: 'choice',
    choiceLabel: '模拟选择',
    resultText: '模拟结果',
    effects: {},
    b50Bonus: 0,
    electionBonus: 0,
  }));
}

function makeNodeResult(kind, tier, score) {
  return {
    id: `${kind}-${tier}`,
    year: 11,
    currentYear: 2025,
    currentMonth: kind === 'election' ? 7 : 12,
    score,
    grade: 'A',
    gradeText: '模拟评级',
    tier,
    rankLabel: tier,
    eventBonus: 0,
    modifiers: [],
    rewards: {},
    message: '模拟节点',
  };
}

const cases = [
  {
    name: '顶点触发',
    state: makeFinalState({
      fans: 7200,
      fanLoyalty: 120,
      popularity: 120,
      electionResults: [makeNodeResult('election', 'center', 960)],
      b50Results: [makeNodeResult('b50', 'high', 720)],
    }),
  },
  {
    name: '舞台记忆触发',
    state: makeFinalState({
      performance: 220,
      planHistory: makePlanHistory('stageFocus', 20),
      electionResults: [makeNodeResult('election', 'top48', 420)],
      b50Results: [makeNodeResult('b50', 'highlight', 860)],
    }),
  },
  {
    name: '粉丝羁绊触发',
    state: makeFinalState({
      fanLoyalty: 220,
      planHistory: makePlanHistory('fanService', 20),
      electionResults: [makeNodeResult('election', 'top48', 440)],
      b50Results: [makeNodeResult('b50', 'ranked', 420)],
    }),
  },
  {
    name: '遗憾兜底触发',
    state: makeFinalState({
      eventHistory: makeEventHistory('lowMood', 10),
      electionResults: [makeNodeResult('election', 'outside', 120)],
      b50Results: [makeNodeResult('b50', 'notRanked', 100)],
    }),
  },
];

const results = cases.map((entry) => {
  const ending = modules.endingLogic.getEndingForState(entry.state);
  const unlockedGallery = modules.gameLogic.mergeUnlockedGallery(entry.state, entry.state.unlockedGallery);

  return {
    case: entry.name,
    endingId: ending.id,
    endingName: ending.name,
    endingCgKey: ending.endingCgKey,
    galleryUnlocked: unlockedGallery.includes(ending.galleryId),
  };
});

const legacySnapshot = modules.gameLogic.normalizeGameSnapshot({
  state: {
    ...modules.gameLogic.createInitialGameState(),
    saveVersion: 3,
    unlockedGallery: ['base', 'happy', 'fanLetterCg'],
  },
  lastPlanId: null,
  lastResult: null,
  pendingEventId: null,
});

console.log(
  JSON.stringify(
    {
      endings: results,
      legacySnapshot: {
        normalized: Boolean(legacySnapshot),
        saveVersion: legacySnapshot?.state.saveVersion,
        preservedGallery: legacySnapshot?.state.unlockedGallery ?? [],
      },
    },
    null,
    2,
  ),
);
