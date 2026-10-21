'use client';
/**
 * Welcome back — Speaking lines (spec §1.6): "Speaking · question 7 of 20", "6 answers saved", where it continues.
 * No timer note. If the browser will ask for the microphone again, the §1.1-a hint sits in this card.
 */
import { ListChecks, Save } from 'lucide-react';
import { useT } from '@/lib/exam/engine/context';
import { useSpeakingResume } from '@/lib/exam/speaking/use-speaking-resume';
import { MicPermissionHint } from '../screens/precheck/MicPermissionHint';
import { Bi } from '../shell/ui';

export function SpeakingResumeFacts() {
  const { bi, t } = useT();
  const { rp, ask, n, allDone } = useSpeakingResume();
  if (!rp) return null;
  const fact = { display: 'flex', gap: 10, alignItems: 'flex-start' } as const;
  return (
    <>
      {!allDone && <div style={fact}><ListChecks size={16} color="var(--x-sub)" style={{ marginTop: 3 }} aria-hidden /><Bi pair={bi('resume.speaking_from', { n, m: rp.total })} size={15} weight={700} /></div>}
      <div style={fact}><Save size={16} color="var(--x-sub)" style={{ marginTop: 3 }} aria-hidden /><Bi pair={bi('resume.saved', { n: rp.saved })} size={15} weight={700} /></div>
      {!allDone && <Bi pair={bi(rp.used ? 'resume.speaking_note_used' : 'resume.speaking_note')} size={13} weight={500} color="var(--x-muted)" />}
      {ask && !allDone && (
        <div style={{ background: 'var(--x-tile)', borderRadius: 12, padding: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
          <MicPermissionHint /><span style={{ fontSize: 13.5, fontWeight: 600 }}>{t('precheck.mic_permission_where')}</span>
        </div>
      )}
    </>
  );
}
