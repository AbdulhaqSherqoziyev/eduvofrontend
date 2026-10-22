'use client';
/**
 * /account — Mobile App.dc.html `profile` (grouped settings rows, toggles, delete-account sheet);
 * desktop per README §11 spec with the same groups. P1/P2, A5, A10, O5/O6 purchases, U1 export,
 * U2 delete (password or Google re-confirm), U3 restore banner while deletion is pending.
 */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LOCALE_NAMES, htmlLang } from '@/i18n/locales';
import { MockApiError } from '@/lib/mock/api/client';
import { changePassword, deleteAccount, exportMyData, getMe, logout, patchMe } from '@/lib/mock/api/endpoints';
import { SUPPORT_EMAIL } from '@/lib/mock/legal';
import { useGoogleSignIn } from '../auth/google';
import { DeletionBanner } from './deletion-banner';
import { Purchases } from './purchases';
import type { Learner } from '@/lib/mock/api/types';
import { fmtDate, fmtScore } from '@/lib/mock/format';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { useLearner } from '@/lib/mock/hooks/use-learner';
import { PHONE_QUERY, useMedia } from '@/lib/mock/hooks/use-media';
import { sx } from '@/lib/mock/sx';
import { applyTheme, currentTheme } from '@/lib/mock/theme';
import { BottomSheet } from '../bottom-sheet';
import { LanguageSheet } from '../language-sheet';
import { Modal } from '../modal';
import { useToast } from '../toast';

type Row = { label: string; value?: React.ReactNode; toggle?: boolean; on?: boolean; go?: () => void; soon?: boolean; href?: string };

export function AccountView() {
  const t = useTranslations('account.account');
  const tc = useTranslations('common');
  const toast = useToast();
  const router = useRouter();
  const { lang, href } = useLang();
  const learner = useLearner();
  const isPhone = useMedia(PHONE_QUERY);
  const [langSheet, setLangSheet] = useState(false);
  const [del, setDel] = useState(false);
  const [edit, setEdit] = useState<'name' | 'password' | null>(null);
  const [dark, setDark] = useState<boolean | null>(null);
  const [purch, setPurch] = useState(false);
  const [exporting, setExporting] = useState(false);
  /** optimistic value of the leaderboard toggle while PATCH runs (leaderboard spec §6) */
  const [lbHiddenOpt, setLbHiddenOpt] = useState<boolean | null>(null);
  // the session (login/refresh) learner may come without the `leaderboard` block — P1 always has it
  const needMe = !!learner && learner.leaderboard === undefined;
  useEffect(() => { if (needMe) void getMe().catch(() => undefined); }, [needMe]);

  if (!learner) return <main style={sx('min-height:60vh')} aria-busy="true" />;
  const L: Learner = learner;
  const isDark = dark ?? (typeof document !== 'undefined' && currentTheme() === 'dark');
  const name = L.displayName || '';
  const initial = (L.displayName || L.email || '?').charAt(0).toUpperCase();

  const toggleNotif = async (k: keyof Learner['notifications']) => {
    // `leaderboard` is on by default when the API has not sent it yet
    const cur = L.notifications[k] ?? true;
    try { await patchMe({ notifications: { [k]: !cur } }); } catch { toast(t('saveErr')); }
  };
  const lbHidden = lbHiddenOpt ?? !!L.leaderboard?.hidden;
  const toggleLb = async () => {
    const next = !lbHidden;
    setLbHiddenOpt(next);
    try { await patchMe({ leaderboardHidden: next }); } catch { toast(t('saveErr')); } finally { setLbHiddenOpt(null); }
  };
  const toggleDark = () => {
    const next = isDark ? 'light' : 'dark';
    applyTheme(next); setDark(!isDark);
    void patchMe({ theme: next }).catch(() => undefined);
  };
  const doExport = async () => {
    if (exporting) return;
    setExporting(true);
    try { await exportMyData(); toast(t('exportDone')); }
    catch (e) { toast((e as Error).message === 'RATE_LIMITED' ? t('exportLimit') : t('exportErr')); }
    finally { setExporting(false); }
  };
  const doLogout = async () => { await logout().catch(() => undefined); router.replace(href('')); };

  const goal = L.goal;
  const groups: Array<{ title: string; rows: Row[] }> = [
    { title: t('groups.account'), rows: [
      { label: t('name'), value: name || t('notSet'), go: () => setEdit('name') },
      { label: t('email'), value: <bdi dir="ltr">{L.email}</bdi> },
      { label: t('password'), value: L.hasPassword ? t('change') : t('set'), go: () => setEdit('password') },
    ] },
    { title: t('groups.prefs'), rows: [
      { label: t('language'), value: <span lang={htmlLang(lang)}>{LOCALE_NAMES[lang]}</span>, go: () => setLangSheet(true) },
      { label: t('dark'), toggle: true, on: isDark, go: toggleDark },
      { label: t('target'), value: goal ? `${goal.exam === 'ielts' ? 'IELTS' : 'SAT'} ${fmtScore(goal.targetScore, goal.exam)}` : t('notSet'), href: href('/onboarding') },
      { label: t('examDate'), value: goal?.examDate ? fmtDate(lang, goal.examDate) : t('notSet'), href: href('/onboarding') },
      { label: t('lbShow'), toggle: true, on: !lbHidden, go: () => void toggleLb() },
    ] },
    { title: t('groups.notif'), rows: [
      { label: t('nResult'), toggle: true, on: L.notifications.resultReady, go: () => void toggleNotif('resultReady') },
      { label: t('nWriting'), toggle: true, on: L.notifications.writingGraded, go: () => void toggleNotif('writingGraded') },
      { label: t('nTips'), toggle: true, on: L.notifications.weeklyTips, go: () => void toggleNotif('weeklyTips') },
      { label: t('nLeaderboard'), toggle: true, on: L.notifications.leaderboard ?? true, go: () => void toggleNotif('leaderboard') },
    ] },
    { title: t('groups.billing'), rows: [{ label: t('purchases'), go: () => setPurch(true) }, { label: t('buy'), href: href('/pricing') }] },
    { title: t('groups.support'), rows: [{ label: t('help'), href: href('/help') }, { label: t('contact'), value: <bdi dir="ltr">{SUPPORT_EMAIL}</bdi>, href: href('/help/contact') }] },
    { title: t('groups.data'), rows: [{ label: t('export'), go: () => void doExport() }, ...(L.status === 'DELETION_PENDING' ? [] : [{ label: t('delete'), go: () => setDel(true) }]), { label: t('logout'), go: () => void doLogout() }] },
  ];

  const rowEl = (r: Row, i: number) => {
    const inner = (
      <>
        <span style={sx('flex:1;font-weight:700;font-size:15px')}>{r.label}</span>
        {r.value != null && <span style={sx('font-size:14px;color:var(--mut);font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:55%')}>{r.value}</span>}
        {r.soon && <span className="m-soon">{tc('chips.soon')}</span>}
        {r.toggle ? (
          <span role="switch" aria-checked={!!r.on} style={{ ...sx('width:50px;height:30px;border-radius:99px;padding:3px;display:flex;box-shadow:var(--inset);flex:none'), justifyContent: r.on ? 'flex-end' : 'flex-start', background: r.on ? 'var(--blue)' : 'var(--hover)' }}>
            <span style={sx('width:24px;height:24px;border-radius:50%;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.2)')} />
          </span>
        ) : (r.go || r.href) && <span aria-hidden className="m-chev" />}
      </>
    );
    const style = sx('width:100%;min-height:54px;border:0;background:transparent;cursor:pointer;color:var(--ink);padding:0 16px;display:flex;align-items:center;gap:12px;text-align:start');
    if (r.href) return <Link key={i} href={r.href} style={style}>{inner}</Link>;
    if (r.go) return <button key={i} type="button" onClick={r.go} style={style}>{inner}</button>;
    return <div key={i} style={{ ...style, cursor: 'default' }}>{inner}</div>;
  };

  const header = (
    <div style={sx('display:flex;align-items:center;gap:14px;padding-top:8px')}>
      <span style={sx('width:64px;height:64px;border-radius:50%;box-shadow:var(--raise);display:grid;place-items:center;font-weight:800;font-size:24px;color:var(--blue);flex:none')}>{initial}</span>
      <span style={sx('display:flex;flex-direction:column;gap:2px;min-width:0')}><b style={sx('font-size:20px')}>{name}</b><span style={sx('font-size:13px;color:var(--mut);font-weight:600;overflow-wrap:anywhere')}><bdi dir="ltr">{L.email}</bdi></span></span>
    </div>
  );
  const groupEls = groups.map((g) => (
    <div key={g.title} style={sx('display:flex;flex-direction:column;gap:8px')}>
      <span className="m-eyebrow" style={sx('color:var(--mut);padding:0 4px')}>{g.title}</span>
      <div className="m-rows">{g.rows.map(rowEl)}</div>
    </div>
  ));

  const deleteContent = <DeleteForm learner={L} onExport={() => void doExport()} onDone={() => { setDel(false); router.replace(href('')); }} />;

  return (
    <>
      <main className="m-desk" style={sx('max-width:1080px;margin:0 auto;padding:clamp(20px,4vw,40px) 20px 56px;display:flex;flex-direction:column;gap:24px')}>
        <h1 className="m-h1" style={sx('font-size:clamp(26px,3.2vw,36px);letter-spacing:var(--ls-h)')}>{t('title')}</h1>
        <DeletionBanner />
        {header}
        <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:24px;align-items:start')}>{groupEls}</div>
        <span style={sx('font-size:11px;color:var(--mut);text-align:center;line-height:1.5')}>{t('footer')}</span>
      </main>
      <main className="m-phone m-with-tabs-phone" style={sx('padding:4px 16px 32px;display:flex;flex-direction:column;gap:20px')}>
        <DeletionBanner />
        {header}
        {groupEls}
        <span style={sx('font-size:11px;color:var(--mut);text-align:center;line-height:1.5')}>{t('footer')}</span>
      </main>

      <LanguageSheet open={langSheet} onClose={() => setLangSheet(false)} />
      {isPhone
        ? <BottomSheet open={del} title={`${t('delete')}?`} onClose={() => setDel(false)}>{deleteContent}</BottomSheet>
        : <Modal open={del} onClose={() => setDel(false)} label={t('delete')}><span style={sx('font-size:20px;font-weight:800')}>{t('delete')}?</span>{deleteContent}</Modal>}
      <EditModal kind={edit} learner={L} onClose={() => setEdit(null)} />
      <Purchases open={purch} onClose={() => setPurch(false)} />
    </>
  );
}

/** name / password editor; the dashboard leaderboard opens it for the name (§4.3) */
export function EditModal({ kind, learner, onClose }: { kind: 'name' | 'password' | null; learner: Learner; onClose: () => void }) {
  const t = useTranslations('account.account');
  const { lang } = useLang();
  const toast = useToast();
  const [name, setName] = useState(learner.displayName ?? '');
  const [cur, setCur] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (kind === 'name') { setName(learner.displayName ?? ''); setErr(''); } }, [kind, learner.displayName]);
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('');
    if (kind === 'password' && pw.length < 8) { setErr(t('short')); return; }
    setBusy(true);
    try {
      if (kind === 'name') { await patchMe({ displayName: name.trim() }); toast(t('saved')); }
      else { await changePassword({ currentPassword: learner.hasPassword ? cur : undefined, newPassword: pw }); toast(t('pwSaved')); }
      onClose();
    } catch (x) {
      if (x instanceof MockApiError && x.code === 'NAME_CHANGE_LIMIT') setErr(t('nameChangeLimit', { date: typeof x.body.availableAt === 'string' ? fmtDate(lang, x.body.availableAt) : '—' }));
      else if (x instanceof MockApiError && (x.code === 'NAME_NOT_ALLOWED' || x.fields.some((f) => f.field === 'displayName' && f.code === 'NAME_NOT_ALLOWED'))) setErr(t('nameNotAllowed'));
      else if (x instanceof MockApiError && x.code === 'INVALID_CREDENTIALS') setErr(t('wrong'));
      else if (x instanceof MockApiError && x.fields.some((f) => f.code === 'PASSWORD_TOO_WEAK')) setErr(t('weak'));
      else setErr(t('saveErr'));
    } finally { setBusy(false); }
  };
  return (
    <Modal open={!!kind} onClose={onClose} label={kind === 'name' ? t('nameTitle') : t('pwTitle')}>
      <form onSubmit={save} noValidate style={sx('display:flex;flex-direction:column;gap:14px')}>
        <span style={sx('font-size:20px;font-weight:800')}>{kind === 'name' ? t('nameTitle') : t('pwTitle')}</span>
        {kind === 'name' ? (
          <>
            <input className="m-input" value={name} maxLength={60} onChange={(e) => { setName(e.target.value); setErr(''); }} aria-label={t('nameTitle')} aria-invalid={!!err} aria-describedby="m-name-hint" />
            <span id="m-name-hint" style={sx('font-size:12px;color:var(--mut);font-weight:600')}>{t('nameHint')}</span>
          </>
        ) : (
          <>
            {learner.hasPassword && <label className="m-field">{t('pwCurrent')}<input className="m-input" type="password" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} /></label>}
            <label className="m-field">{t('pwNew')}<input className="m-input" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} aria-invalid={!!err} /></label>
          </>
        )}
        {err && <span className="m-err-text" role="alert">{err}</span>}
        <div style={sx('display:flex;gap:10px;justify-content:flex-end')}>
          <button type="button" className="m-btn m-btn--soft" onClick={onClose} style={sx('height:44px;padding:0 16px;border-radius:13px;font-size:15px')}>{t('cancel')}</button>
          <button type="submit" className="m-btn m-btn--primary" disabled={busy} style={sx('height:44px;padding:0 18px;border-radius:13px;font-size:15px')}>{busy && <span className="m-spin" aria-hidden />}{kind === 'name' ? t('nameSave') : t('pwSave')}</button>
        </div>
      </form>
    </Modal>
  );
}

/** U2 delete: password (or Google re-confirm for Google-only accounts), optional reason. */
function DeleteForm({ learner, onExport, onDone }: { learner: Learner; onExport: () => void; onDone: () => void }) {
  const t = useTranslations('account.account');
  const google = useGoogleSignIn();
  const [pw, setPw] = useState('');
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const run = async (body: { password?: string; googleIdToken?: string }) => {
    setErr(''); setBusy(true);
    try {
      await deleteAccount({ ...body, ...(reason.trim() ? { reason: reason.trim().slice(0, 500) } : {}) });
      await logout().catch(() => undefined); // sessions are revoked server-side; clear this tab and the others
      onDone();
    } catch (e) {
      const code = e instanceof MockApiError ? e.code : '';
      setErr(code === 'INVALID_CREDENTIALS' ? t('del.wrong') : code === 'GOOGLE_TOKEN_INVALID' ? t('del.googleErr') : code === 'ALREADY_PENDING' ? t('del.already') : t('del.err'));
    } finally { setBusy(false); }
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (learner.hasPassword) { if (!pw) { setErr(t('del.wrong')); return; } await run({ password: pw }); return; }
    const idToken = await google.signIn().catch(() => null);
    if (!idToken) { setErr(t('del.googleErr')); return; }
    await run({ googleIdToken: idToken });
  };
  return (
    <form onSubmit={(e) => void submit(e)} noValidate style={sx('display:flex;flex-direction:column;gap:12px')}>
      <span style={sx('font-size:15px;line-height:1.6;color:var(--ink2)')}>{t('deleteBody')}</span>
      <button type="button" className="m-btn m-btn--soft" onClick={onExport} style={sx('height:52px;border-radius:16px;font-size:15px;font-weight:800')}>{t('download')}</button>
      {learner.hasPassword && (
        <label className="m-field">{t('del.pw')}<input className="m-input" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} aria-invalid={!!err} /></label>
      )}
      <label className="m-field">{t('del.reason')}<input className="m-input" value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} /></label>
      {err && <span className="m-err-text" role="alert">{err}</span>}
      <button type="submit" disabled={busy} style={sx('height:52px;border-radius:16px;border:0;background:var(--ink);color:var(--bg);font-weight:800;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px')}>
        {busy && <span className="m-spin" aria-hidden />}{learner.hasPassword ? t('del.confirm') : t('del.google')}
      </button>
    </form>
  );
}
