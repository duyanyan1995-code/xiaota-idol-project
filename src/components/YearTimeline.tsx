import {
  FINAL_CHAPTER_FLAME_MONTH,
  MONTHS_PER_YEAR,
  getAnnualCalendar,
} from '../config/annualCalendar';
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
  const finalElectionMonth = calendar.finalElectionMonth ?? electionMonth;
  const isFinalChapter = Boolean(calendar.isFinalChapter);
  const months = Array.from({ length: MONTHS_PER_YEAR }, (_, index) => index + 1);

  return (
    <section className="year-timeline" aria-label="年度时间线">
      <div className="timeline-meta">
        <strong>{formatYearMonth(state.currentYear, state.currentMonth)}</strong>
        <span>{formatAnnualProgress(state.currentMonth)}</span>
      </div>
      <div className="timeline-countdown">
        {isFinalChapter ? (
          <>
            <span>{formatMonthsUntil('FLAME', state.currentMonth, FINAL_CHAPTER_FLAME_MONTH)}</span>
            <span>{formatMonthsUntil('最终总选', state.currentMonth, finalElectionMonth)}</span>
          </>
        ) : (
          <>
            <span>{formatMonthsUntil('总选', state.currentMonth, electionMonth)}</span>
            <span>{formatMonthsUntil('B50', state.currentMonth, b50Month)}</span>
          </>
        )}
      </div>
      <div className="timeline-months" aria-label={`${state.currentYear} 年月份进度`}>
        {months.map((month) => {
          const isCurrent = month === state.currentMonth;
          const isPast = month < state.currentMonth;
          const isElection = month === (isFinalChapter ? finalElectionMonth : electionMonth);
          const isB50 = !isFinalChapter && month === b50Month;
          const isFlame = isFinalChapter && month === FINAL_CHAPTER_FLAME_MONTH;
          const className = [
            'timeline-month',
            isCurrent ? 'timeline-month--current' : '',
            isPast ? 'timeline-month--past' : '',
            isElection ? 'timeline-month--election' : '',
            isB50 ? 'timeline-month--b50' : '',
            isFlame ? 'timeline-month--b50' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <span className={className} key={month}>
              <span>{month}</span>
              {isFlame ? <small>FLAME</small> : null}
              {isElection ? <small>{isFinalChapter ? '终选' : '总选'}</small> : null}
              {isB50 ? <small>B50</small> : null}
            </span>
          );
        })}
      </div>
    </section>
  );
}
