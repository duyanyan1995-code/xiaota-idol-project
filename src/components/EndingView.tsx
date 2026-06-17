import { CHARACTER_IMAGES } from '../config/characterImages';
import type { EndingConfig, GameState } from '../types/game';
import { CharacterDisplay } from './CharacterDisplay';

interface EndingViewProps {
  ending: EndingConfig;
  state: GameState;
}

export function EndingView({ ending, state }: EndingViewProps) {
  return (
    <section className="ending-view">
      <CharacterDisplay image={CHARACTER_IMAGES.stage} caption="阶段结算" />
      <div className="panel ending-card">
        <p className="eyebrow">30 天阶段结局</p>
        <h1>{ending.name}</h1>
        <p>{ending.text}</p>
        <div className="ending-stats">
          <div>
            <span>粉丝</span>
            <strong>{state.fans}</strong>
          </div>
          <div>
            <span>人气</span>
            <strong>{state.popularity}</strong>
          </div>
          <div>
            <span>唱舞</span>
            <strong>{state.vocal + state.dance}</strong>
          </div>
          <div>
            <span>状态</span>
            <strong>{Math.min(state.energy, state.mood)}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

