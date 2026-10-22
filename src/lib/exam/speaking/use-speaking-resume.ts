'use client';
/** Resume facts for "Welcome back" (ERP card and the mock.eduvo.uz card): where Speaking continues and what is saved. */
import { useEffect, useState } from 'react';
import { useExam } from '../engine/context';
import { micPermission } from './recorder';
import { resumePoint, type ResumePoint } from './resume';

export function useSpeakingResume() {
  const { s, welcomeContent } = useExam();
  const [rp, setRp] = useState<ResumePoint | null>(null);
  const [ask, setAsk] = useState(false);
  const c = welcomeContent();
  const ready = c?.kind === 'speaking';
  useEffect(() => { void micPermission().then((p) => setAsk(p === 'prompt')); }, []);
  useEffect(() => {
    if (!c || c.kind !== 'speaking') return;
    let dead = false;
    void resumePoint(s.attemptId, c, s.spRecorded, s.spRestarted).then((r) => { if (!dead) setRp(r); });
    return () => { dead = true; };
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!rp) return { rp: null, ask, n: 0, allDone: false };
  // all answers saved: nothing to "continue from"; a used restart moves on to the next question
  const allDone = rp.saved >= rp.total;
  const n = rp.next ? Math.min(rp.total, rp.questionNo + 1) : rp.questionNo;
  return { rp, ask, n, allDone };
}
