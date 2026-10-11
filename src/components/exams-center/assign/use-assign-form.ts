'use client';

import { useState } from 'react';
import type { CatalogFamily, Family } from '@/lib/api/center-exams-v3';
import type { Group } from '@/lib/types/group';
import { useCreateAssignment, usePublishedTests } from '@/lib/hooks/use-center-exams';
import { familySoon } from '../exam-meta';

const pad = (n: number) => String(n).padStart(2, '0');
const isoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Next full hour → +3 h (design default "10:00 – 13:00"). */
function defaults() {
  const d = new Date();
  const h = Math.min(d.getHours() + 1, 20);
  return { date: isoDay(d), range: `${pad(h)}:00 – ${pad(Math.min(h + 3, 23))}:00` };
}

/** "10:00 – 13:00" (any dash, optional spaces) → ["10:00", "13:00"]. */
export function parseRange(v: string): [string, string] | null {
  const m = /^\s*(\d{1,2})[:.](\d{2})\s*[-–—]\s*(\d{1,2})[:.](\d{2})\s*$/.exec(v);
  if (!m) return null;
  const [h1, m1, h2, m2] = m.slice(1).map(Number);
  if (h1 > 23 || h2 > 23 || m1 > 59 || m2 > 59) return null;
  return [`${pad(h1)}:${pad(m1)}`, `${pad(h2)}:${pad(m2)}`];
}

/**
 * State of the "Guruhga mock tayinlash" modal (design: exam family, group, date,
 * time range). Test variant and mode are hidden defaults: the newest published
 * test of the family, full mock.
 */
export function useAssignForm(families: CatalogFamily[], groups: Group[], presetFamily?: Family) {
  // "Tez kunda" families cannot be assigned: a preset of one falls back to the first launched family.
  const ready = families.filter((x) => !familySoon(x));
  const preset = presetFamily && ready.some((x) => x.family === presetFamily) ? presetFamily : undefined;
  const [family, setFamily] = useState<Family>(preset ?? ready[0]?.family ?? 'IELTS');
  const [groupId, setGroupId] = useState(groups[0]?.id ?? '');
  const [win, setWin] = useState(defaults);
  const [touched, setTouched] = useState(false);
  const create = useCreateAssignment();
  const tests = usePublishedTests();

  const fam = ready.find((f) => f.family === family);
  const test = (tests.data ?? [])
    .filter((t) => fam?.examCodes.includes(t.examCode))
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))[0];
  const group = groups.find((g) => g.id === groupId);
  const headcount = group?.studentCount ?? 0;
  const price = fam?.priceCredits ?? null;
  const cost = price != null ? price * headcount : null;
  const range = parseRange(win.range);
  const start = range ? new Date(`${win.date}T${range[0]}`) : null;
  const end = range ? new Date(`${win.date}T${range[1]}`) : null;

  const problem = !fam ? 'Imtihonni tanlang.'
    : tests.isLoading ? null
    : !test ? "Bu imtihon uchun nashr qilingan test yo'q."
    : !group ? 'Guruhni tanlang.'
    : headcount === 0 ? "Bu guruhda o'quvchi yo'q."
    : !start || !end || Number.isNaN(start.getTime()) ? "Sana va vaqtni kiriting (masalan, 10:00 – 13:00)."
    : end <= start ? "Tugash vaqti boshlanishdan keyin bo'lsin."
    : end.getTime() < Date.now() ? "Vaqt oralig'i o'tib ketgan." : null;

  const submit = (onDone: () => void) => {
    setTouched(true);
    if (problem || !test || !start || !end) return;
    create.mutate(
      { testId: test.id, mode: 'full', groupId, windowStart: start.toISOString(), windowEnd: end.toISOString() },
      { onSuccess: onDone },
    );
  };

  return {
    family, setFamily, groupId, setGroupId, group, win, setWin, headcount, price, cost,
    problem: touched ? problem : null, submit, create,
  };
}
