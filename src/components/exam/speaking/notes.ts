'use client';
/** Part 2 notes: device only (spec §1.4 — not graded, never sent), restored after a reload. */
import { useCallback, useState } from 'react';
import { patchSpeakingLocal, speakingLocal } from '@/lib/exam/speaking/local';

export function useNotes(attemptId: string) {
  const [value, setValue] = useState(() => speakingLocal(attemptId).notes);
  const set = useCallback((v: string) => { setValue(v); patchSpeakingLocal(attemptId, { notes: v }); }, [attemptId]);
  return { value, set };
}
