'use client';

import { Bell, Check } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { NmButton } from '@/components/ui/nm-button';
import { NmSelect } from '@/components/ui/nm-select';
import { dayLabel, firstName } from '../_lib/api';
import {
  CENTER_PHONE,
  lessonSplit,
  nextLessonLine,
  todayMark,
  weekAttendance,
  type Overview,
} from '../_lib/types';
import { PaymentLine } from './portal-payment';

const CARD = 'p-4 sm:p-5';

/**
 * Which child is on screen — remembered between visits.
 *
 * It used to reset to the first child on every open, so a parent of two picked
 * the same name every single time and could easily read the wrong child's day
 * without noticing.
 */
export function ChildPicker({
  children,
  value,
  onChange,
}: {
  children: { studentId: string; fullName: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  if (children.length < 2) return null;

  if (children.length > 2) {
    return (
      <div className="sticky top-0 z-20">
        <NmSelect value={value} onChange={(e) => onChange(e.target.value)} aria-label="Farzand">
          {children.map((c) => (
            <option key={c.studentId} value={c.studentId}>
              Farzand: {c.fullName}
            </option>
          ))}
        </NmSelect>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-20 flex gap-2">
      {children.map((c) => {
        const on = c.studentId === value;
        return (
          <button
            key={c.studentId}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(c.studentId)}
            className={`min-h-[44px] flex-1 truncate rounded-ctl px-4 text-[13px] font-bold transition-all ${
              on ? 'bg-background text-primary shadow-nm-inset' : 'bg-background text-muted shadow-nm-sm'
            }`}
          >
            {c.fullName}
          </button>
        );
      })}
    </div>
  );
}

/**
 * One sentence about today, in plain words.
 *
 * Nothing here is red and nothing is dramatic: a parent reading "kelmadi" on a
 * phone at work needs the fact, not an alarm. There is no icon on the absent
 * case either — a red mark next to a child's name is a verdict.
 */
function todaySentence(d: Overview, name: string): string {
  const { today, next } = lessonSplit(d.lessons);
  if (!today) {
    return next
      ? `${name} uchun bugun dars yo'q. ${nextLessonLine(next)}`
      : `${name} uchun hozircha dars belgilanmagan.`;
  }
  const mark = todayMark(d.attendance?.list ?? [], today);
  if (!mark) return `${name} bugun ${today.time} dagi darsda. Davomat hali belgilanmagan.`;
  switch (mark.status) {
    case 'PRESENT':
      return `${name} bugun ${today.time} dagi darsga keldi.`;
    case 'LATE':
      return `${name} bugun ${today.time} dagi darsga kech keldi.`;
    case 'ABSENT':
      return `${name} bugun ${today.time} dagi darsga kelmadi.`;
    case 'EXCUSED':
      return `${name} bugun ${today.time} dagi darsda yo'q — sababli.`;
    default:
      return `${name} bugun ${today.time} dagi darsda. Davomat hali belgilanmagan.`;
  }
}

export function ParentHome({
  d,
  child,
  onChild,
  onPayments,
  onMarkRead,
}: {
  d: Overview;
  child: string;
  onChild: (id: string) => void;
  onPayments: () => void;
  onMarkRead: () => void;
}) {
  const kids = d.children ?? [];
  if (!kids.length && !d.student?.fullName) {
    return (
      <NmCard className={CARD}>
        <p className="text-[13.5px] font-semibold leading-[1.55] text-foreground">
          Farzand biriktirilmagan. O&apos;quv markazingizga murojaat qiling:{' '}
          <a className="font-bold text-primary" href={`tel:${CENTER_PHONE.replace(/\s/g, '')}`}>
            {CENTER_PHONE}
          </a>
        </p>
      </NmCard>
    );
  }

  const name = firstName(d.student.fullName);
  const week = weekAttendance(d.attendance?.list ?? []);
  const total = (d.assignments ?? []).length;
  const done = (d.assignments ?? []).filter((a) => a.submitted).length;
  const notes = d.notifications ?? [];

  return (
    <>
      <ChildPicker children={kids} value={child} onChange={onChild} />

      <NmCard className={CARD}>
        <p className="text-[15px] font-bold leading-[1.5] text-foreground">{todaySentence(d, name)}</p>
        <p className="mt-2 text-[13px] font-semibold text-muted">
          {week.total
            ? `Bu hafta ${week.total} darsdan ${week.attended} tasiga keldi.`
            : "Bu hafta hali dars bo'lmadi."}
        </p>
      </NmCard>

      <NmCard className={CARD}>
        <div className="mb-2 text-[13.5px] font-extrabold text-foreground">{name} — to&apos;lov</div>
        <PaymentLine d={d} />
        <NmButton variant="soft" className="mt-3 min-h-[44px] w-full" onClick={onPayments}>
          Batafsil
        </NmButton>
      </NmCard>

      <NmCard className={CARD}>
        <div className="mb-2 text-[13.5px] font-extrabold text-foreground">{name} — vazifalar</div>
        <p className="text-[13px] font-semibold text-muted">
          {total ? `${name}: ${total} tadan ${done} tasi topshirilgan.` : 'Hali vazifa berilmagan.'}
        </p>
      </NmCard>

      <NmCard className={CARD}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[13.5px] font-extrabold text-foreground">
            <Bell className="size-4 text-primary" />
            Markazdan xabarlar
            {d.unreadCount ? (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">{d.unreadCount}</span>
            ) : null}
          </div>
          {d.unreadCount ? (
            <button
              type="button"
              onClick={onMarkRead}
              className="inline-flex min-h-[44px] items-center gap-1 rounded-ctl bg-background px-3 text-[12px] font-bold text-primary shadow-nm-sm"
            >
              <Check className="size-3.5" />
              O&apos;qildi
            </button>
          ) : null}
        </div>
        {notes.length ? (
          <div className="flex flex-col gap-1.5">
            {notes.slice(0, 12).map((n) => (
              <div
                key={n.id}
                className={`rounded-[12px] bg-background px-3 py-2 text-[12.5px] shadow-nm-inset-sm ${
                  n.read ? '' : 'ring-1 ring-primary/30'
                }`}
              >
                <div className="flex justify-between gap-2">
                  <span className="font-bold text-foreground">{n.title}</span>
                  <span className="shrink-0 text-[11.5px] font-semibold text-muted">{dayLabel(n.date)}</span>
                </div>
                {n.body ? <p className="mt-0.5 font-semibold text-muted">{n.body}</p> : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] font-semibold text-muted">Markazdan yangi xabar yo&apos;q.</p>
        )}
      </NmCard>
    </>
  );
}
