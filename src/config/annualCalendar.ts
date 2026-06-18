export interface AnnualCalendarConfig {
  year: number;
  electionMonth?: number;
  b50Month?: number;
}

export const CAREER_START_YEAR = 2015;
export const CAREER_END_YEAR = 2025;
export const MONTHS_PER_YEAR = 12;

export const ANNUAL_CALENDAR: AnnualCalendarConfig[] = Array.from(
  { length: CAREER_END_YEAR - CAREER_START_YEAR + 1 },
  (_, index) => ({
    year: CAREER_START_YEAR + index,
    electionMonth: 7,
    b50Month: 12,
  }),
);

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

