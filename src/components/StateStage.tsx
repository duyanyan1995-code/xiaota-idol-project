import { useEffect, useState } from 'react';

import { STATUS_PORTRAITS } from '../config/statusPortraits';
import type { GameState } from '../types/game';
import {
  getCurrentMainState,
  getCurrentTendencyLabel,
  getMainStateMeta,
  getStatusWarnings,
} from '../utils/statusStageLogic';

interface StateStageProps {
  state: GameState;
}

export function StateStage({
  state,
}: StateStageProps) {
  const mainState = getCurrentMainState(state);
  const meta = getMainStateMeta(mainState);
  const portrait = STATUS_PORTRAITS[mainState];
  const [hasPortraitError, setHasPortraitError] = useState(false);
  const warnings = getStatusWarnings(state);

  useEffect(() => {
    setHasPortraitError(false);
  }, [portrait.src]);

  return (
    <section className={`state-stage state-stage--${mainState}`} aria-label="状态舞台区">
      <div className="state-stage__portrait" aria-label={portrait.alt}>
        {!hasPortraitError ? (
          <img
            className="state-stage__portrait-image"
            src={portrait.src}
            alt={portrait.alt}
            onError={() => setHasPortraitError(true)}
          />
        ) : (
          <div className="state-stage__portrait-fallback">
            <span>杨小獭</span>
            <small>{portrait.placeholderText}</small>
          </div>
        )}
        <div className="state-stage__portrait-glow" aria-hidden="true" />
      </div>

      <div className="state-stage__content">
        <div className="state-stage__tags" aria-label="当前状态标签">
          <span>杨小獭</span>
          <span>当前倾向：{getCurrentTendencyLabel(state)}</span>
          <span>{meta.label}</span>
        </div>

        {warnings.length > 0 ? (
          <div className="state-stage__warnings" aria-label="状态提醒">
            {warnings.map((warning) => (
              <span key={warning}>{warning}</span>
            ))}
          </div>
        ) : null}

      </div>
    </section>
  );
}
