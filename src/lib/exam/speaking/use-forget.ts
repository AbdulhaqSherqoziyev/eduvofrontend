'use client';
/** Learner result pages: once Speaking is no longer pending, the device copy of the audio is wiped (cleanup.ts). */
import { useEffect } from 'react';
import type { SpeakingResult } from '../speaking-types';
import { forgetSpeakingDevice, sweepSpeakingDevice } from './cleanup';

export function useForgetSpeakingDevice(attemptId: string | null | undefined, sp: SpeakingResult | null | undefined) {
  const done = !!sp && sp.status !== 'pending';
  useEffect(() => {
    sweepSpeakingDevice();
    if (attemptId && done) void forgetSpeakingDevice(attemptId);
  }, [attemptId, done]);
}
