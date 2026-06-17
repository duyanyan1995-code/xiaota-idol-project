import type { RandomEventChoice, RandomEventConfig } from '../types/game';

interface EventModalProps {
  event: RandomEventConfig | null;
  onChoose: (choice: RandomEventChoice) => void;
}

export function EventModal({ event, onChoose }: EventModalProps) {
  if (!event) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="event-title">
        <p className="eyebrow">随机事件</p>
        <h2 id="event-title">{event.title}</h2>
        <p>{event.description}</p>
        <div className="modal-actions">
          {event.choices.map((choice) => (
            <button
              className="button button--primary"
              type="button"
              key={choice.id}
              onClick={() => onChoose(choice)}
            >
              {choice.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

