'use client';
/** End of Speaking (spec §1.5): once every recording is uploaded, "View results" submits the stage. */
import { useState } from 'react';
import { useExam } from '@/lib/exam/engine/context';
import { forgetSpeakingDevice } from '@/lib/exam/speaking/cleanup';

export function useFinishStage() {
  const { s, submit } = useExam();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const i = s.stages.findIndex((x) => x.stageKey === s.stageKey);
  const last = !s.stages.slice(i + 1).some((x) => x.status === 'PENDING');
  const go = async () => {
    setBusy(true);
    setFailed(false);
    const id = s.attemptId;
    const ok = await submit('user');
    if (!ok) { setFailed(true); setBusy(false); return; }
    void forgetSpeakingDevice(id); // the server has every recording — the device copy goes (privacy)
  };
  return { last, busy, failed, go };
}
