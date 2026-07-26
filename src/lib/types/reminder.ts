/** Debt reminders — the 3/7/14-day ladder the daily cron prepares. */

export type ReminderStage = 'D3' | 'D7' | 'D14';
export type ReminderStatus = 'PENDING' | 'SENT' | 'SKIPPED';

export interface Reminder {
  id: string;
  studentId: string;
  studentName: string;
  /** Student's phone — the fallback channel when Telegram is not linked. */
  phone: string;
  stage: ReminderStage;
  status: ReminderStatus;
  /** Outstanding balance on the invoice, in UZS. */
  amount: number;
  invoiceId: string;
  /** A parent or the student has the Telegram bot linked. */
  tgLinked: boolean;
  createdAt: string;
  sentAt: string | null;
}

export const STAGE_META: Record<ReminderStage, { label: string; hint: string; tone: 'muted' | 'warning' | 'danger' }> = {
  // Labels read as time, not as jargon: the hint lives in a title attribute and
  // a phone never shows it, so "D3" would be the whole message on mobile.
  D3: { label: '3 kun', hint: '3 kun kechikkan', tone: 'muted' },
  D7: { label: '7 kun', hint: '7 kun kechikkan', tone: 'warning' },
  D14: { label: '14 kun', hint: '14 kun kechikkan', tone: 'danger' },
};
