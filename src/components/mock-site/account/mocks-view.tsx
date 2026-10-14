'use client';
/** /mocks — Mobile App.dc.html `mocks` (In progress / Completed, grouped rows, New mock); desktop uses the same list in a card. D3. */
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getAttempts } from '@/lib/mock/api/endpoints';
import type { AttemptListItem } from '@/lib/mock/api/types';
import { fmtDate, fmtScore } from '@/lib/mock/format';
import { useDelayedFlag } from '@/lib/mock/hooks/use-delayed';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { useLearner } from '@/lib/mock/hooks/use-learner';
import { sx } from '@/lib/mock/sx';
import { Segmented } from '../segmented';

const SEC: Record<string, string> = { listening: 'Listening', reading: 'Reading', writing: 'Writing', reading_writing: 'Reading and Writing', math: 'Math' };

export function MocksView() {
  const router = useRouter();
  const t = useTranslations('account.mocks');
  const td = useTranslations('dashboard');
  const { lang, href } = useLang();
  const learner = useLearner();
  const [tab, setTab] = useState<'in_progress' | 'completed'>('completed');
  const [lists, setLists] = useState<Record<string, { items: AttemptListItem[]; next: string | null } | undefined>>({});
  const [err, setErr] = useState(false);

  const load = useCallback(async (status: 'in_progress' | 'completed', cursor?: string) => {
    setErr(false);
    try {
      const r = await getAttempts({ status, cursor, limit: 20 });
      setLists((l) => ({ ...l, [status]: { items: [...(cursor ? l[status]?.items ?? [] : []), ...r.items], next: r.nextCursor } }));
    } catch { setErr(true); }
  }, []);
  useEffect(() => { if (learner) { void load('in_progress'); void load('completed'); } }, [learner, load]);
  const cur = lists[tab];
  const slow = useDelayedFlag(!cur && !err);

  const row = (m: AttemptListItem) => {
    const name = `${m.mode === 'full' ? td('full') : td('section', { section: SEC[m.sectionKey ?? 'reading'] })} · `;
    const date = fmtDate(lang, m.finishedAt ?? m.startedAt);
    const meta0 = m.status === 'in_progress' ? td('metaStarted', { date }) : m.status === 'grading' ? td('metaGrading', { date }) : m.status === 'expired' ? td('metaExpired', { date }) : m.status === 'cancelled' ? td('metaCancelled', { date }) : m.notGraded ? td('metaNotGraded', { date }) : date;
    const meta = m.correct != null && m.total ? `${meta0} · ${td('correctOf', { correct: m.correct, total: m.total })}` : meta0;
    const score = m.score?.value != null ? fmtScore(m.score.value, m.exam) : m.score?.label ?? '—';
    const to = m.status === 'in_progress' ? href(`/exam/${m.attemptId}`) : href(`/results/${m.attemptId}`);
    return (
      <a key={m.attemptId} href={m.status === 'expired' ? undefined : to} onClick={(e) => { if (m.status !== 'expired' && !e.metaKey && !e.ctrlKey) { e.preventDefault(); router.push(to); } }} style={sx('width:100%;color:var(--ink);padding:16px;display:flex;align-items:center;gap:12px;text-align:start')}>
        <span style={{ ...sx('width:40px;height:40px;border-radius:12px;box-shadow:var(--inset);display:grid;place-items:center;font-size:10px;font-weight:800;flex:none'), color: `var(--${m.exam})` }} lang="en">{m.exam === 'ielts' ? 'IELTS' : 'SAT'}</span>
        <span style={sx('flex:1;display:flex;flex-direction:column;gap:2px;min-width:0')}><b style={sx('font-size:15px')}>{name}<bdi dir="ltr">{m.testCode}</bdi></b><span style={sx('font-size:12px;color:var(--mut);font-weight:600')}>{meta}</span></span>
        <span style={sx('display:flex;flex-direction:column;align-items:flex-end;gap:2px')}><b style={sx('font-size:17px')}><bdi dir="ltr">{score}</bdi></b>
          {m.status !== 'expired' && m.status !== 'cancelled' && <span style={{ ...sx('font-size:12px;font-weight:800'), color: m.status === 'in_progress' ? 'var(--blue)' : 'var(--ink2)' }}>{m.status === 'in_progress' ? t('resume') : t('result')}</span>}</span>
      </a>
    );
  };

  const body = (
    <>
      <Segmented grid label={t('title')} value={tab} onChange={setTab} style={sx('border-radius:16px')} btnStyle={sx('height:42px;border-radius:12px;font-weight:800;font-size:14px')}
        items={[{ key: 'in_progress', label: lists.in_progress ? t('inProgress', { n: lists.in_progress.items.length }) : t('inProgressShort') }, { key: 'completed', label: lists.completed ? t('completed', { n: lists.completed.items.length }) : t('completedShort') }]} />
      {err && <div className="m-banner m-banner--err" role="alert" style={sx('align-items:center')}><span style={sx('flex:1')}>{td('loadError')}</span><button type="button" className="m-btn m-btn--soft m-btn--sm" onClick={() => { void load('in_progress'); void load('completed'); }}>{td('retry')}</button></div>}
      {!cur && slow && <div className="m-card" style={sx('height:220px;border-radius:20px')} />}
      {cur && (
        <div className="m-rows">
          {cur.items.length ? cur.items.map(row) : <span style={sx('display:block;padding:16px;font-size:14px;color:var(--ink2)')}>{t('empty')}</span>}
        </div>
      )}
      {cur?.next && <button type="button" className="m-btn m-btn--ghost" onClick={() => void load(tab, cur.next!)} style={sx('align-self:center')}>{t('more')}</button>}
      <Link href={href(`/start/${learner?.goal?.exam ?? 'ielts'}?mode=full`)} className="m-btn m-btn--soft" style={sx('height:52px;border-radius:16px;color:var(--blue);font-weight:800;font-size:15px')}>{t('newMock')}</Link>
    </>
  );
  return (
    <>
      <main className="m-desk" style={sx('max-width:880px;margin:0 auto;padding:clamp(20px,4vw,40px) 20px 56px;display:flex;flex-direction:column;gap:16px')}>
        <h1 className="m-h1" style={sx('font-size:clamp(26px,3.2vw,36px);letter-spacing:var(--ls-h)')}>{t('title')}</h1>
        {body}
      </main>
      <main className="m-phone m-with-tabs-phone" style={sx('padding:4px 16px 24px;display:flex;flex-direction:column;gap:16px')}>
        <h1 style={sx('margin:0;font-size:30px;font-weight:800;letter-spacing:var(--ls-h)')}>{t('title')}</h1>
        {body}
      </main>
    </>
  );
}
