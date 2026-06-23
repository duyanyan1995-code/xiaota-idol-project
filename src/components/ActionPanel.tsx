import { PLAN_BY_ID, PLANS } from '../config/plans';
import type { GameState, MonthlyActionOption, PlanConfig, PlanId, StatKey } from '../types/game';
import { getCurrentMonthlyActionOptions } from '../utils/actionRoll';
import { getPlanAvailability } from '../utils/unlockLogic';

const MAX_VISIBLE_STATS = 3;

const PLAN_BOOST_TAGS: Partial<Record<PlanId, string[]>> = {
  theaterTraining: ['舞台', '唱功', '舞蹈'],
  fanService: ['粉丝', '应援', '魅力'],
  outsideExposure: ['影响', '资源', '粉丝'],
  stageFocus: ['舞台', '舞蹈', '唱功'],
  imageBuilding: ['魅力', '影响', '粉丝'],
  restAndReflect: ['体力', '心情', '降压'],
  stableOperation: ['应援', '运营', '疲劳↓'],
};

const SHORT_STAT_LABELS: Record<StatKey, string> = {
  stamina: '体力',
  mood: '心情',
  pressure: '压力',
  vocal: '唱功',
  dance: '舞蹈',
  stagePower: '舞台',
  fanCount: '粉丝',
  supportPower: '应援',
  influence: '影响',
  resource: '资源',
  charm: '魅力',
  operation: '运营',
  fanFatigue: '疲劳',
};

interface ActionPanelProps {
  state: GameState;
  disabled?: boolean;
  onPlan: (planId: PlanId) => void;
}

export function ActionPanel({ state, disabled = false, onPlan }: ActionPanelProps) {
  const monthlyOptions = getCurrentMonthlyActionOptions(state);
  const displayOptions =
    monthlyOptions.length > 0 ? monthlyOptions : buildFallbackMonthlyOptions(state);

  return (
    <section className="panel action-panel" aria-label="本月行动">
      <div className="action-grid">
        {displayOptions.map((option) => (
          <ActionButton
            availability={getPlanAvailability(PLAN_BY_ID[option.planId], state)}
            disabled={disabled}
            key={option.id}
            onPlan={onPlan}
            option={option}
          />
        ))}
      </div>
    </section>
  );
}

function ActionButton({
  availability,
  disabled,
  onPlan,
  option,
}: {
  availability: ReturnType<typeof getPlanAvailability>;
  disabled: boolean;
  onPlan: (planId: PlanId) => void;
  option: MonthlyActionOption;
}) {
  const { plan, unlocked, lockedReason } = availability;
  const isDisabled = disabled || !unlocked;
  const classNames = [
    'button button--action',
    !unlocked ? 'button--action-locked' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classNames}
      type="button"
      disabled={isDisabled}
      onClick={() => {
        if (unlocked) {
          onPlan(plan.id);
        }
      }}
    >
      <span className="action-card__name">{plan.name}</span>
      <div className="action-card__meta">
        <span className="action-card__tags">
          {getBoostTags(plan).map((tag) => (
            <span className="action-tag action-tag--stat" key={tag}>
              {tag}
            </span>
          ))}
        </span>
      </div>
      {!unlocked && lockedReason ? (
        <small className="action-card__locked">未解锁：{lockedReason}</small>
      ) : null}
    </button>
  );
}

function getBoostTags(plan: PlanConfig): string[] {
  const fixedTags = PLAN_BOOST_TAGS[plan.id];
  if (fixedTags) {
    return fixedTags;
  }

  const orderedStats = [...plan.primaryStats, ...plan.secondaryStats];
  const uniqueStats = Array.from(new Set<StatKey>(orderedStats));

  return uniqueStats.slice(0, MAX_VISIBLE_STATS).map((key) => SHORT_STAT_LABELS[key]);
}

function buildFallbackMonthlyOptions(state: GameState): MonthlyActionOption[] {
  return PLANS.filter((plan) => plan.actionPoolId && !plan.isSpecialAction)
    .slice(0, 4)
    .map((plan) => ({
      id: `fallback-action-option-${state.currentYear}-${state.currentMonth}-${plan.id}`,
      year: state.year,
      currentYear: state.currentYear,
      currentMonth: state.currentMonth,
      planId: plan.id,
      actionPoolId: plan.actionPoolId!,
      variantText: plan.variantPool?.[0] ?? plan.name,
    }));
}
