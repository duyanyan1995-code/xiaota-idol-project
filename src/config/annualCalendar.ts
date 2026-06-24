export interface AnnualCalendarConfig {
  year: number;
  electionMonth?: number;
  b50Month?: number;
  finalElectionMonth?: number;
  isFinalChapter?: boolean;
}

export const CAREER_START_YEAR = 2015;
export const CAREER_END_YEAR = 2025;
export const FINAL_CHAPTER_YEAR = 2026;
export const CAREER_MAX_YEAR = FINAL_CHAPTER_YEAR;
export const FINAL_CHAPTER_FLAME_MONTH = 6;
export const FINAL_CHAPTER_ELECTION_MONTH = 7;
export const MONTHS_PER_YEAR = 12;

export const ANNUAL_CALENDAR: AnnualCalendarConfig[] = Array.from<unknown, AnnualCalendarConfig>(
  { length: CAREER_END_YEAR - CAREER_START_YEAR + 1 },
  (_, index) => ({
    year: CAREER_START_YEAR + index,
    electionMonth: 7,
    b50Month: 12,
  }),
).concat({
  year: FINAL_CHAPTER_YEAR,
  finalElectionMonth: FINAL_CHAPTER_ELECTION_MONTH,
  isFinalChapter: true,
});

export function getAnnualCalendar(year: number): AnnualCalendarConfig {
  return (
    ANNUAL_CALENDAR.find((entry) => entry.year === year) ?? {
      year,
      electionMonth: 7,
      b50Month: 12,
    }
  );
}

export function getCareerYear(currentYear: number): number {
  return currentYear - CAREER_START_YEAR + 1;
}

export function isFinalCareerMonth(currentYear: number, currentMonth: number): boolean {
  return currentYear === CAREER_END_YEAR && currentMonth === MONTHS_PER_YEAR;
}

export function isFinalChapterYear(currentYear: number): boolean {
  return currentYear === FINAL_CHAPTER_YEAR;
}
