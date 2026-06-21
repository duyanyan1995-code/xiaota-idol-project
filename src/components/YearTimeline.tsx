import { MONTHS_PER_YEAR, getAnnualCalendar } from '../config/annualCalendar';
import type { GameState } from '../types/game';
import {
  formatAnnualProgress,
  formatMonthsUntil,
  formatYearMonth,
} from '../utils/dateDisplay';

interface YearTimelineProps {
  state: GameState;
}

export function YearTimeline({ state }: YearTimelineProps) {
  const calendar = getAnnualCalendar(state.currentYear);
  const electionMonth = calendar.electionMonth ?? 7;
  const b50Month = calendar.b50Month ?? 12;
  const months = Array.from({ length: MONTHS_PER_YEAR }, (_, index) => index + 1);

  return (
    <section className="year-timeline" aria-label="年度时间线">
      <div className="timeline-meta">
        <strong>{formatYearMonth(state.currentYear, state.currentMonth)}</strong>
        <span>{formatAnnualProgress(state.currentMonth)}</span>
      </div>
      <div className="timeline-countdown">
        <span>{formatMonthsUntil('总选', state.currentMonth, electionMonth)}</span>
        <span>{formatMonthsUntil('B50', state.currentMonth, b50Month)}</span>
      </div>
      <div className="timeline-months" aria-label={`${state.currentYear} 年月份进度`}>
        {months.map((month) => {
          const isCurrent = month === state.currentMonth;
          const isPast = month < state.currentMonth;
          const isElection = month === electionMonth;
          const isB50 = month === b50Month;
          const className = [
            'timeline-month',
            isCurrent ? 'timeline-month--current' : '',
            isPast ? 'timeline-month--past' : '',
            isElection ? 'timeline-month--election' : '',
            isB50 ? 'timeline-month--b50' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <span className={className} key={month}>
              <span>{month}</span>
              {isElection ? <small>总选</small> : null}
              {isB50 ? <small>B50</small> : null}
            </span>
          );
        })}
      </div>
    </section>
  );
}
