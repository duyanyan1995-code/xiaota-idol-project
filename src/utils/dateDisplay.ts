import {
  CAREER_END_YEAR,
  CAREER_START_YEAR,
  MONTHS_PER_YEAR,
} from '../config/annualCalendar';

export const CAREER_TOTAL_YEARS = CAREER_END_YEAR - CAREER_START_YEAR + 1;

export function formatGameYearLabel(yearIndex: number, totalYears = CAREER_TOTAL_YEARS): string {
  return `第 ${yearIndex} 年 / 共 ${totalYears} 年`;
}

export function formatYearMonth(year: number, month: number): string {
  return `${year} 年 ${month} 月`;
}

export function formatAnnualProgress(month: number, totalMonths = MONTHS_PER_YEAR): string {
  return `年度进度 ${month} / ${totalMonths}`;
}

export function formatMonthsUntil(label: string, currentMonth: number, targetMonth: number): string {
  const monthDiff = targetMonth - currentMonth;

  if (monthDiff === 0) {
    return `本月${label}`;
  }

  if (monthDiff === 1) {
    return `下月${label}`;
  }

  if (monthDiff > 1) {
    const spacer = /^[A-Za-z0-9]/.test(label) ? ' ' : '';
    return `${label}${spacer}还有 ${monthDiff} 个月`;
  }

  return `${label}已结束`;
}

export function formatMonthlyActionLabel(month: number, actionName: string): string {
  return `${month} 月 ${actionName}`;
}
