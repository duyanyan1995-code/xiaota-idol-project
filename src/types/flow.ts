import type { GameFeedback, RandomEventConfig, StatChange } from './game';

export interface CountSummaryItem {
  label: string;
  count: number;
}

export interface MonthlySummaryData {
  kind: 'manual' | 'auto';
  title: string;
  subtitle?: string;
  actionFeedback?: GameFeedback | null;
  eventFeedback?: GameFeedback | null;
  noEventText?: string;
  importantEvent?: Pick<RandomEventConfig, 'id' | 'title' | 'description'> | null;
  monthCount?: number;
  actionCounts?: CountSummaryItem[];
  eventCounts?: CountSummaryItem[];
  changes: StatChange[];
  stopReason?: string;
}

export type FlowPanelState =
  | {
      type: 'inlineActionResult';
      summary: MonthlySummaryData;
      continueLabel: string;
    }
  | {
      type: 'inlineEventSummary';
      summary: MonthlySummaryData;
      continueLabel: string;
    }
  | {
      type: 'autoAdvancing';
      summary: MonthlySummaryData;
    }
  | {
      type: 'autoAdvanceSummary';
      summary: MonthlySummaryData;
      continueLabel: string;
    };
