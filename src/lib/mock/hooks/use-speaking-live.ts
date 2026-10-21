'use client';
/** Client view of the Speaking launch flag: the build value on the first render (no hydration mismatch), the dev override after mount. */
import { useEffect, useState } from 'react';
import { useCatalog } from '../catalog';
import { ieltsHasSpeaking, speakingLive } from '../speaking-live';

export function useSpeakingLive(): boolean {
  const [on, setOn] = useState(process.env.NEXT_PUBLIC_SPEAKING_LIVE === '1');
  useEffect(() => { setOn(speakingLive()); }, []);
  return on;
}

/** IELTS Speaking is on sale: flag on and the catalog (already flag-filtered) has the section. */
export function useIeltsSpeaking(): boolean {
  const live = useSpeakingLive();
  const c = useCatalog();
  return live && c.status === 'ready' && ieltsHasSpeaking(c.data);
}
