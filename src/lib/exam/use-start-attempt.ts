'use client';
/**
 * StartDialog logic (§3.3 + Sevara round 2): POST attempts → player. Errors
 * become dialog states, never a toast: an unfinished attempt is offered to
 * continue; an attempt already finished goes to its result.
 */
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { HubError, hubApi, hubNow } from './hub-api';
import { activeSummary } from './hub-derive';
import { dayLong, hm } from './hub-format';
import type { HubAssignment } from './hub-types';
import { ht } from './i18n/hub';
import { useCreateAttempt } from './use-hub';

export type StartIssue =
  | { kind: 'active'; attemptId: string; text: string }
  | { kind: 'window'; text: string }
  | { kind: 'failed'; text: string };

export const playerUrl = (id: string) => `/exam/${encodeURIComponent(id)}`;
export const resultUrl = (id: string) => `/exams/attempts/${encodeURIComponent(id)}/result`;

export function useStartAttempt() {
  const router = useRouter();
  const create = useCreateAttempt();
  const [issue, setIssue] = useState<StartIssue | null>(null);
  const [resolving, setResolving] = useState(false);

  async function onExisting(attemptId: string) {
    try {
      const st = await hubApi.attempt(attemptId);
      if (st.attempt.status !== 'ACTIVE') {
        router.push(resultUrl(attemptId));
        return;
      }
      const s = activeSummary(st, hubNow());
      setIssue({ kind: 'active', attemptId, text: ht('hub.active_attempt', { section: s.section, t: s.left }) });
    } catch {
      setIssue({ kind: 'failed', text: ht('hub.start_failed') });
    }
  }

  async function start(a: HubAssignment) {
    setIssue(null);
    try {
      const r = await create.mutateAsync({ testId: a.testId, mode: a.mode, sectionKey: a.sectionKey ?? undefined, assignmentId: a.id });
      router.push(playerUrl(r.attemptId));
    } catch (e) {
      const err = e instanceof HubError ? e : null;
      const existing = typeof err?.body?.attemptId === 'string' ? (err.body.attemptId as string) : null;
      if (existing && (err?.code === 'ACTIVE_ATTEMPT_EXISTS' || err?.code === 'ALREADY_ATTEMPTED')) {
        setResolving(true);
        await onExisting(existing);
        setResolving(false);
        return;
      }
      if (err?.code === 'OUTSIDE_WINDOW') {
        const ws = String(err.body?.windowStart ?? a.windowStart);
        const we = String(err.body?.windowEnd ?? a.windowEnd);
        const early = hubNow() < Date.parse(ws);
        setIssue({
          kind: 'window',
          text: early ? ht('errors.window_not_open', { date: dayLong(ws), time: hm(ws) }) : ht('errors.window_closed', { date: dayLong(we), time: hm(we) }),
        });
        return;
      }
      if (err?.kind === 'auth' || err?.code === 'CABINET_DISABLED') {
        router.replace('/exams/login');
        return;
      }
      setIssue({ kind: 'failed', text: ht('hub.start_failed') });
    }
  }

  return { start, issue, clear: () => setIssue(null), busy: create.isPending || resolving };
}
