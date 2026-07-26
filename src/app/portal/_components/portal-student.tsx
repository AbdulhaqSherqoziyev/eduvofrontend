'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { NmButton } from '@/components/ui/nm-button';
import { dayLabel, dotDate, firstName } from '../_lib/api';
import {
  ATT_LABEL,
  lessonSplit,
  nextLessonLine,
  todayLessonLine,
  type Overview,
} from '../_lib/types';
import { PortalAssignment, type AssignmentRow } from './portal-assignment';
import { GamificationCard, RatingBreakdown, RatingChip, StreakWell, isNewStudent } from './portal-gamification';

const CARD = 'p-4 sm:p-5';

/** Homework the child still owes, soonest first. */
export function pendingAssignments(list: AssignmentRow[]): AssignmentRow[] {
  return (list ?? []).filter((a) => !a.submitted).sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
}

/**
 * The student's home screen, in the order Sevara fixed: what is happening
 * today, what is owed, then the encouraging parts. Money is not on this screen
 * at all — it lives in Profil, for the adult courses where the student pays.
 */
export function StudentHome({
  d,
  onSubmitAssignment,
}: {
  d: Overview;
  onSubmitAssignment: (id: string) => void;
}) {
  const [ratingOpen, setRatingOpen] = useState(false);
  const { today, next } = lessonSplit(d.lessons);
  const pending = pendingAssignments(d.assignments).slice(0, 2);
  const recent = (d.attendance?.list ?? []).slice(0, 5);
  const g = d.gamification;

  return (
    <>
      {/* Header — no sign-out button here. It sits in Profil, behind a confirm,
          because the login came from the centre and cannot be reset at home. */}
      <NmCard className={CARD}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="truncate text-[17px] font-extrabold text-foreground">
              Salom, {firstName(d.student.fullName)}
            </div>
            <div className="mt-1 truncate text-[13px] font-semibold text-muted">
              {today ? todayLessonLine(today) : next ? `Bugun darsingiz yo'q. ${nextLessonLine(next)}` : 'Hozircha dars belgilanmagan.'}
            </div>
          </div>
          {g ? <RatingChip rating={d.rating} g={g} open={ratingOpen} onToggle={() => setRatingOpen((v) => !v)} /> : null}
        </div>
        {g && ratingOpen ? <RatingBreakdown g={g} /> : null}
      </NmCard>

      {pending.length ? (
        pending.map((a) => (
          <NmCard key={a.id} className={CARD}>
            <div className="text-[11px] font-bold uppercase tracking-wide text-muted">Topshirilmagan vazifa</div>
            <div className="mt-1.5 text-[15px] font-extrabold leading-snug text-foreground">{a.title}</div>
            {/* No countdown: a clock ticking down on homework is pressure, not information. */}
            <div className="mt-1 truncate text-[13px] font-semibold text-muted">
              {a.group} · {dayLabel(a.dueDate)}
            </div>
            <NmButton className="mt-3 min-h-[44px] w-full" onClick={() => onSubmitAssignment(a.id)}>
              Topshirish
            </NmButton>
          </NmCard>
        ))
      ) : (
        <NmCard className={CARD}>
          <div className="flex items-center gap-2 text-[13.5px] font-bold text-success">
            <Check className="size-4 shrink-0" />
            Topshirilmagan vazifa yo&apos;q. Barakalla.
          </div>
        </NmCard>
      )}

      {g && !isNewStudent(g) ? <StreakWell streak={g.streak} /> : null}
      {g ? <GamificationCard g={g} rating={d.rating} role={d.role} hideStreak /> : null}

      <NmCard className={CARD}>
        <div className="mb-2 text-[13.5px] font-extrabold text-foreground">Oxirgi darslar</div>
        {recent.length ? (
          <div className="flex flex-col gap-1.5">
            {recent.map((a, i) => (
              <div key={i} className="flex justify-between gap-2 text-[13px]">
                <span className="truncate font-semibold text-muted">
                  {dotDate(a.date)} · {a.group}
                </span>
                <span className="shrink-0 font-bold text-foreground">
                  {ATT_LABEL[a.status] ?? a.status}
                  {a.lateMinutes ? ` +${a.lateMinutes}'` : ''}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] font-semibold text-muted">Hali dars bo&apos;lmadi.</p>
        )}
      </NmCard>
    </>
  );
}

/** Vazifalar tab — everything, with what is still owed on top. */
export function AssignmentsTab({
  d,
  token,
  onDone,
  openId,
}: {
  d: Overview;
  token: string;
  onDone: () => void;
  openId: string | null;
}) {
  const list = [...(d.assignments ?? [])].sort((a, b) => {
    if (a.submitted !== b.submitted) return a.submitted ? 1 : -1;
    return a.dueDate < b.dueDate ? -1 : 1;
  });
  if (!list.length) {
    return (
      <NmCard className={CARD}>
        <p className="text-[13px] font-semibold leading-[1.55] text-muted">
          Hali vazifa berilmagan. Yangi vazifa chiqsa shu yerda ko&apos;rinadi.
        </p>
      </NmCard>
    );
  }
  return (
    <NmCard className={CARD}>
      <div className="mb-2 text-[13.5px] font-extrabold text-foreground">Vazifalar</div>
      <div className="flex flex-col gap-2.5">
        {list.map((a) => (
          <PortalAssignment
            key={a.id}
            a={a}
            role={d.role}
            token={token}
            onDone={onDone}
            autoOpen={openId === a.id}
          />
        ))}
      </div>
    </NmCard>
  );
}

/**
 * Davomat tab — the list first, the percentage last and small. A big number on
 * a child's screen turns a fact into a verdict.
 */
export function AttendanceTab({ d, name }: { d: Overview; name?: string }) {
  const list = (d.attendance?.list ?? []).slice(0, 20);
  const attended = list.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
  const parent = d.role === 'parent';
  return (
    <NmCard className={CARD}>
      <div className="mb-2 text-[13.5px] font-extrabold text-foreground">
        {parent && name ? `${name} — davomat` : 'Davomat'}
      </div>
      {list.length ? (
        <>
          <div className="flex flex-col gap-1.5">
            {list.map((a, i) => (
              <div key={i} className="flex justify-between gap-2 text-[13px]">
                <span className="truncate font-semibold text-muted">
                  {dotDate(a.date)} · {a.group}
                </span>
                <span className="shrink-0 font-bold text-foreground">
                  {ATT_LABEL[a.status] ?? a.status}
                  {a.lateMinutes ? ` +${a.lateMinutes}'` : ''}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12.5px] font-semibold text-muted">
            {parent
              ? `So'nggi ${list.length} darsdan ${attended} tasiga kelgan.`
              : `So'nggi ${list.length} darsdan ${attended} tasiga kelgansiz.`}
          </p>
        </>
      ) : (
        <p className="text-[13px] font-semibold text-muted">Hali dars bo&apos;lmadi.</p>
      )}
    </NmCard>
  );
}
