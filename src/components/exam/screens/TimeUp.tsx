'use client';
/**
 * Neutral "Time's up" (Sevara T21/T22, design G9 + H2): no modal, no toast, no
 * unanswered count, no progress line. Continue appears after 3 s with a 200 ms
 * fade in a pre-reserved slot (layout doesn't jump). Spinner while the server acks.
 */
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useExam, useT } from '@/lib/exam/engine/context';
import { Bi, Btn, Centered, Spinner } from '../shell/ui';

export function TimeUp() {
  const { s, dispatch } = useExam();
  const { t, bi } = useT();
  const [canGo, setCanGo] = useState(false);
  useEffect(() => { const tm = window.setTimeout(() => setCanGo(true), 3000); return () => window.clearTimeout(tm); }, []);
  const tu = s.timeup;
  const acked = !!tu?.acked;
  const last = acked && !s.stageKey;

  return (
    <Centered>
      <div style={{ width: 520, background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 22, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
        <Clock size={36} color="var(--x-muted)" aria-hidden />
        <Bi pair={bi('timeup.title')} size={24} weight={800} center />
        <Bi pair={bi('timeup.body')} size={15} weight={500} center />
        {tu?.writing && <Bi pair={bi('timeup.writing_saved')} size={14} weight={500} center />}
        {tu?.next ? <Bi pair={bi('timeup.next', { section: tu.next.title, min: tu.next.minutes })} size={14} weight={700} center /> : acked && <Bi pair={bi('timeup.last')} size={14} weight={500} center />}
        <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 6 }}>
          {!acked ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--x-sub)' }}><Spinner /> {t('finish.submitting')}</span>
          ) : canGo ? (
            <Btn h={48} variant="accent" className="x-fade-in" autoFocus onClick={() => dispatch({ t: 'TIMEUP_ACK' })} style={{ fontSize: 15, padding: '0 28px' }}>
              {last ? t('chrome.view_results') : t('chrome.continue')}
            </Btn>
          ) : null}
        </div>
      </div>
    </Centered>
  );
}
