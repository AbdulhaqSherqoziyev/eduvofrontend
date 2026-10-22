'use client';
/** mock.eduvo.uz "Welcome back" — Speaking (speaking-design §1.6): question n of m, answers saved, where it continues; no timer note. */
import { ListChecks, Save } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useT } from '@/lib/exam/engine/context';
import { useSpeakingResume } from '@/lib/exam/speaking/use-speaking-resume';
import { sx } from '@/lib/mock/sx';

export function MockSpeakingFacts({ fact }: { fact: CSSProperties }) {
  const { t } = useT();
  const { rp, ask, n, allDone } = useSpeakingResume();
  if (!rp) return null;
  return (
    <>
      <div style={sx('border-radius:16px;box-shadow:var(--inset);padding:16px;display:flex;flex-direction:column;gap:10px')}>
        {!allDone && <div style={fact}><ListChecks size={17} style={{ marginTop: 3, color: 'var(--ink2)' }} aria-hidden /><span>{t('resume.speaking_from', { n, m: rp.total })}</span></div>}
        <div style={fact}><Save size={17} style={{ marginTop: 3, color: 'var(--ink2)' }} aria-hidden /><span>{t('resume.saved', { n: rp.saved })}</span></div>
      </div>
      {!allDone && <div style={sx('font-size:13px;font-weight:600;color:var(--mut);line-height:1.5')}>{t(rp.next ? 'resume.speaking_note_used' : 'resume.speaking_note')}</div>}
      {ask && !allDone && <div style={sx('font-size:13px;font-weight:600;color:var(--ink2);line-height:1.5')}>{t('precheck.mic_permission_where')}</div>}
    </>
  );
}
