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
  autoAdvanceLogic: loadModule('src/utils/autoAdvanceLogic.ts'),
  flowImportance: loadModule('src/utils/flowImportance.ts'),
  events: loadModule('src/config/events.ts'),
};

function createSeededRandom(seed) {
  let current = seed >>> 0;
  return () => {
    current = (current * 1664525 + 1013904223) >>> 0;
    return current / 4294967296;
  };
}

const initial = modules.gameLogic.createInitialGameState();
const electionMonthState = {
  ...initial,
  currentYear: 2015,
  currentMonth: 7,
  phase: 'monthStart',
};
const electionStop = modules.autoAdvanceLogic.runAutoAdvance(electionMonthState);
const commonEvent = modules.events.RANDOM_EVENTS.find((event) => event.id === 'publicShowReview');
const cgEvent = modules.events.RANDOM_EVENTS.find((event) => event.id === 'fanCreation');
Math.random = createSeededRandom(202609);
const ordinaryRun = modules.autoAdvanceLogic.runAutoAdvance({
  ...initial,
  currentYear: 2015,
  currentMonth: 3,
  phase: 'monthStart',
});

console.log(
  JSON.stringify(
    {
      electionStop: {
        monthCount: electionStop.summary.monthCount,
        stopReason: electionStop.summary.stopReason,
        phase: electionStop.snapshot.state.phase,
        currentMonth: electionStop.snapshot.state.currentMonth,
      },
      eventImportance: {
        commonEvent: commonEvent?.id,
        commonShouldPause: commonEvent
          ? modules.flowImportance.shouldPauseForEvent(commonEvent, initial)
          : null,
        cgEvent: cgEvent?.id,
        cgShouldPause: cgEvent
          ? modules.flowImportance.shouldPauseForEvent(cgEvent, initial)
          : null,
      },
      ordinaryRun: {
        monthCount: ordinaryRun.summary.monthCount,
        stopReason: ordinaryRun.summary.stopReason,
        phase: ordinaryRun.snapshot.state.phase,
        pendingEvent: ordinaryRun.pendingEvent?.id ?? null,
        actions: ordinaryRun.summary.actionCounts,
        events: ordinaryRun.summary.eventCounts,
      },
    },
    null,
    2,
  ),
);
