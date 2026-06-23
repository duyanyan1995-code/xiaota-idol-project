import { RANDOM_EVENTS } from '../config/events';
import { PLAN_BY_ID } from '../config/plans';
import type { GameState, PlanId, RouteId } from '../types/game';

export interface RouteScore {
  id: RouteId;
  label: string;
  score: number;
}

export const ROUTE_LABELS: Record<RouteId, string> = {
  stage: '舞台',
  fan: '粉丝',
  outside: '外务',
  style: '风格',
  stable: '稳定',
  recovery: '恢复',
};

const ROUTE_EVENT_TAGS: Record<RouteId, string[]> = {
  stage: ['舞台', '练习', 'B50', '透支'],
  fan: ['粉丝', '应援', '营业', '生日'],
  outside: ['外务', '曝光', '舆论', '路人盘'],
  style: ['风格', '形象', '物料', '舆论'],
  stable: ['运营', '日常', '低风险'],
  recovery: ['恢复', '休息', '沉淀', '日常'],
};

const EVENT_CONFIG_BY_ID = RANDOM_EVENTS.reduce<
  Record<string, { tone: string; triggerTags: string[] }>
>((result, event) => {
  result[event.id] = {
    tone: event.tone,
    triggerTags: event.triggerTags,
  };
  return result;
}, {});

export function calculateRouteScores(state: GameState): RouteScore[] {
  const scores: Record<RouteId, number> = {
    stage: 0,
    fan: 0,
    outside: 0,
    style: 0,
    stable: 0,
    recovery: 0,
  };

  state.planHistory.forEach((entry) => {
    const plan = PLAN_BY_ID[entry.planId];
    const routeTags = plan?.routeTags ?? getFallbackPlanRoutes(entry.planId);
    routeTags.forEach((route) => {
      scores[route] += plan?.isSpecialAction ? 5 : 3;
    });
  });

  state.eventHistory.forEach((entry) => {
    const event = EVENT_CONFIG_BY_ID[entry.eventId];
    if (!event) {
      return;
    }

    Object.entries(ROUTE_EVENT_TAGS).forEach(([route, tags]) => {
      if (hasAnyTag(event.triggerTags, tags)) {
        scores[route as RouteId] += event.tone === 'positive' ? 2 : 1;
      }
    });
  });

  state.electionResults.forEach((result) => {
    if (isElectionAtLeast(result.tier, 'top32')) {
      scores.fan += 3;
      scores.outside += 1;
    }

    if (isElectionAtLeast(result.tier, 'top16')) {
      scores.fan += 2;
    }
  });

  state.b50Results.forEach((result) => {
    if (isB50AtLeast(result.tier, 'high')) {
      scores.stage += 3;
    }

    if (isB50AtLeast(result.tier, 'highlight')) {
      scores.stage += 2;
    }
  });

  return Object.entries(scores)
    .map(([id, score]) => ({
      id: id as RouteId,
      label: ROUTE_LABELS[id as RouteId],
      score,
    }))
    .sort((a, b) => b.score - a.score);
}

export function getTopRoutes(state: GameState, limit = 2): RouteScore[] {
  return calculateRouteScores(state)
    .filter((route) => route.score > 0)
    .slice(0, limit);
}

export function getRouteSummaryLabel(state: GameState): string {
  const topRoutes = getTopRoutes(state, 2);
  return topRoutes.length > 0 ? topRoutes.map((route) => route.label).join(' / ') : '未定';
}

export function getRouteEventWeightMultiplier(
  routeScores: RouteScore[],
  eventTags: string[],
): number {
  const topRoutes = routeScores.filter((route) => route.score >= 12).slice(0, 2);

  if (topRoutes.length === 0) {
    return 1;
  }

  const bonus = topRoutes.reduce((total, route) => {
    const tags = ROUTE_EVENT_TAGS[route.id];
    if (!hasAnyTag(eventTags, tags)) {
      return total;
    }

    return total + Math.min(route.score, 60) / 300;
  }, 0);

  return 1 + Math.min(bonus, 0.3);
}

export function getFallbackPlanRoutes(planId: PlanId): RouteId[] {
  const routes: Record<PlanId, RouteId[]> = {
    theaterTraining: ['stage'],
    fanService: ['fan'],
    outsideExposure: ['outside'],
    stageFocus: ['stage'],
    imageBuilding: ['style'],
    restAndReflect: ['recovery'],
    stableOperation: ['stable'],
    specialSoloWork: ['outside'],
    specialIntensiveTraining: ['stage'],
    specialBirthdaySupport: ['fan'],
    specialStyleShift: ['style'],
  };

  return routes[planId];
}

export function isElectionAtLeast(current: unknown, target: string): boolean {
  const order = ['outside', 'ranked', 'top48', 'top32', 'top16', 'kami7', 'top3', 'center'];
  return order.indexOf(String(current)) >= order.indexOf(target);
}

export function isB50AtLeast(current: unknown, target: string): boolean {
  const order = ['notRanked', 'ranked', 'middle', 'high', 'highlight', 'legend'];
  return order.indexOf(String(current)) >= order.indexOf(target);
}

function hasAnyTag(sourceTags: string[], targetTags: string[]): boolean {
  return sourceTags.some((tag) => targetTags.includes(tag));
}
