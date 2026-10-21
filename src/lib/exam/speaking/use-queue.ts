'use client';
/** Live upload-queue state for the UI (end-of-section card, "recording queued" banner). */
import { useEffect, useState } from 'react';
import { queueFor, type QueueState } from './queue';

export function useQueue(attemptId: string): QueueState {
  const [st, setSt] = useState<QueueState>(() => queueFor(attemptId).state);
  useEffect(() => queueFor(attemptId).subscribe(setSt), [attemptId]);
  return st;
}
