import { PLANS } from '../config/plans';
import type { GameState, PlanConfig, PlanId, StatKey } from '../types/game';
import { getPlanAvailability } from '../utils/unlockLogic';

const MAX_VISIBLE_STATS = 3;

const SHORT_DESCRIPTIONS: Record<PlanId, string> = {
  theaterTraining: '打磨基础唱跳与舞台表现',
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

const STAT_LABELS: Record<StatKey, string> = {
  vocal: '唱功',
  dance: '舞蹈',
  performance: '舞台表现',
  fanLoyalty: '粉丝粘性',
  charm: '魅力',
  popularity: '人气',
  fans: '粉丝数',
  energy: '体力',
  mood: '心情',
  stress: '压力',
  resources: '资源',
  style: '风格',
};

interface ActionPanelProps {
  state: GameState;
  disabled?: boolean;
  onPlan: (planId: PlanId) => void;
}

export function ActionPanel({ state, disabled = false, onPlan }: ActionPanelProps) {
  const planAvailability = PLANS.map((plan) => getPlanAvailability(plan, state));
  const basePlans = planAvailability.filter(({ plan }) => !plan.isSpecialAction);
  const specialPlans = planAvailability.filter(({ plan }) => plan.isSpecialAction);

  return (
    <section className="panel action-panel" aria-label="本月行动">
      <div className="action-grid">
        {basePlans.map((item) => (
          <ActionButton
            availability={item}
            disabled={disabled}
            key={item.plan.id}
            wide={item.plan.id === 'stableOperation'}
            onPlan={onPlan}
          />
        ))}
      </div>
      <div className="special-action-group" aria-label="特殊行动">
        <div className="special-action-group__title">
          <span>特殊行动</span>
          <small>满足条件后开放</small>
        </div>
        <div className="special-action-grid">
          {specialPlans.map((item) => (
            <ActionButton
              availability={item}
              disabled={disabled}
              key={item.plan.id}
              onPlan={onPlan}
              special
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ActionButton({
  availability,
  disabled,
  wide = false,
  special = false,
  onPlan,
}: {
  availability: ReturnType<typeof getPlanAvailability>;
  disabled: boolean;
  wide?: boolean;
  special?: boolean;
  onPlan: (planId: PlanId) => void;
}) {
  const { plan, unlocked, lockedReason } = availability;
  const isDisabled = disabled || !unlocked;
  const classNames = [
    'button button--action',
    wide ? 'button--action-wide' : '',
    special ? 'button--action-special' : '',
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
      <small className="action-card__desc">{SHORT_DESCRIPTIONS[plan.id]}</small>
      <div className="action-card__meta">
        <span className="action-card__label">可能提升</span>
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

function getStatLabel(key: StatKey): string {
  return STAT_LABELS[key];
}

function getBoostTags(plan: PlanConfig): string[] {
  const orderedStats = [...plan.primaryStats, ...plan.secondaryStats];
  const uniqueStats = Array.from(new Set<StatKey>(orderedStats));

  return uniqueStats.slice(0, MAX_VISIBLE_STATS).map(getStatLabel);
}
