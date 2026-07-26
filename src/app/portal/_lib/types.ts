import type { AssignmentRow } from '../_components/portal-assignment';
import type { Gamification } from '../_components/portal-gamification';
import { dayLabel, periodLabel, todayIso, weekStartIso } from './api';

export interface Invoice {
  period: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: string;
}
export interface PaymentRow {
  date: string;
  amount: number;
  method: string;
  note: string;
  period: string;
}
export interface LessonRow {
  date: string;
  time: string;
  group: string;
  room: string;
}
export interface AttendanceRow {
  date: string;
  group: string;
  status: string;
  lateMinutes: number;
}
export interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
}

export interface Overview {
  role: string;
  student: { fullName: string; phone: string; gender: string | null; birthYear: number | null };
  groups: { id: string; name: string; teacherName: string; schedule: string; time: string; room: string }[];
  lessons: LessonRow[];
  attendance: { rate: number; list: AttendanceRow[] };
  assignments: AssignmentRow[];
  finance: { balance: number; invoices: Invoice[]; payments: PaymentRow[] };
  children: { studentId: string; fullName: string }[];
  notifications: NotificationRow[];
  unreadCount: number;
  rating: number;
  gamification?: Gamification;
}

/** Attendance words. Colour never carries the meaning alone — the word does. */
export const ATT_LABEL: Record<string, string> = {
  PRESENT: 'Keldi',
  LATE: 'Kech',
  ABSENT: 'Kelmadi',
  EXCUSED: 'Sababli',
};

export const PAY_METHOD: Record<string, string> = { CASH: 'Naqd', CLICK: 'Click', PAYME: 'Payme' };

export const CENTER_PHONE = '+998 77 317 05 21';

/** Today's lesson, and the next one after today. */
export function lessonSplit(lessons: LessonRow[]) {
  const today = todayIso();
  const list = lessons ?? [];
  return {
    today: list.find((l) => l.date === today) ?? null,
    next: list.find((l) => l.date > today) ?? null,
  };
}

/** "Bugun 15:00 · Ingliz A2 · 3-xona" — one line, always. */
export function todayLessonLine(l: LessonRow): string {
  return `Bugun ${l.time} · ${l.group}${l.room ? ` · ${l.room}` : ''}`;
}

/** "Keyingi dars: 29-iyul, 15:00." */
export function nextLessonLine(l: LessonRow): string {
  return `Keyingi dars: ${dayLabel(l.date)}, ${l.time}.`;
}

/** This week's attendance, Monday to today. */
export function weekAttendance(list: AttendanceRow[]) {
  const from = weekStartIso();
  const week = (list ?? []).filter((a) => a.date >= from);
  const attended = week.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
  return { total: week.length, attended };
}

/** Today's mark for the given lesson, if the teacher has already saved one. */
export function todayMark(list: AttendanceRow[], lesson: LessonRow | null): AttendanceRow | null {
  if (!lesson) return null;
  return (list ?? []).find((a) => a.date === lesson.date && (!a.group || a.group === lesson.group)) ?? null;
}

export type PayState =
  | { kind: 'none' }
  | { kind: 'paid'; period: string }
  | { kind: 'unpaid'; period: string; left: number; due: string }
  | { kind: 'overdue'; period: string; left: number; due: string };

/**
 * The one place that decides what the money line says. The word "Qarz" appears
 * nowhere: a child opens this screen several times a day and a family's balance
 * is not their failing to carry.
 */
export function payState(invoices: Invoice[]): PayState {
  const list = invoices ?? [];
  if (!list.length) return { kind: 'none' };
  const open = list
    .filter((i) => i.status !== 'PAID' && i.amount - i.paidAmount > 0)
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
  if (!open.length) return { kind: 'paid', period: periodLabel(list[0].period) };
  const iv = open[0];
  const left = iv.amount - iv.paidAmount;
  const overdue = iv.status === 'OVERDUE' || iv.dueDate < todayIso();
  return {
    kind: overdue ? 'overdue' : 'unpaid',
    period: periodLabel(iv.period),
    left,
    due: dayLabel(iv.dueDate),
  };
}
