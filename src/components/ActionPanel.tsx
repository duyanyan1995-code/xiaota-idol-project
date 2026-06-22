import { PLAN_BY_ID, PLANS } from '../config/plans';
import type { GameState, MonthlyActionOption, PlanConfig, PlanId, StatKey } from '../types/game';
import { getCurrentMonthlyActionOptions } from '../utils/actionRoll';
import { getStatLabel } from '../utils/statDisplay';
import { getPlanAvailability } from '../utils/unlockLogic';

const MAX_VISIBLE_STATS = 3;

const SHORT_DESCRIPTIONS: Record<PlanId, string> = {
  theaterTraining: '打磨基础唱跳与舞台力',
  fanService: '回应粉丝，维持陪伴感',
  outsideExposure: '参加外部活动，扩大认知',
  stageFocus: '集中打磨舞台记忆点',
  imageBuilding: '建立风格与辨识度',
  restAndReflect: '恢复体力和心情',
  stableOperation: '低风险地稳定成长',
  specialSoloWork: '独立外务，扩大认知',
  specialIntensiveTraining: '短期冲刺基础能力',
  specialBirthdaySupport: '凝聚生日应援心意',
  specialStyleShift: '尝试更鲜明的风格',
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
      <small className="action-card__desc">{option.variantText}</small>
      <small className="action-card__note">{SHORT_DESCRIPTIONS[plan.id]}</small>
      <div className="action-card__meta">
        <span className="action-card__label">主要影响</span>
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
  const orderedStats = [...plan.primaryStats, ...plan.secondaryStats];
  const uniqueStats = Array.from(new Set<StatKey>(orderedStats));

  return uniqueStats.slice(0, MAX_VISIBLE_STATS).map(getStatLabel);
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
