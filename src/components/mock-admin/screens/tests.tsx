'use client';
/**
 * Admin Tests.dc.html — X1 families (tabs, "Tez kunda" badge), X5 site status (Owner only), X2 list,
 * X3 publish/unpublish/archive/restore/preview (confirm: the bank is shared with B2B centres),
 * X4 import (stage → dry-run report → commit as draft).
 */
import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-mock/api';
import { AdminApiError } from '@/lib/admin-mock/http';
import { errText } from '@/lib/admin-mock/errors';
import { dayMonth, groupNum } from '@/lib/admin-mock/format';
import type { ExamSlug, ImportStage, TestFamily, TestItem } from '@/lib/admin-mock/types';
import { useAdminShell } from '../shell/context';
import { Button, IconButton } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { ErrorState } from '../ui/state';
import { SkeletonRows } from '../ui/table';
import { useToast } from '../ui/toast';
import { useUrlState } from './hooks';

/** Preview player: the ERP player route (`/exam/{attemptId}?preview=`) lives on the ERP host. */
const PREVIEW_ORIGIN = process.env.NEXT_PUBLIC_ADMIN_MOCK_PREVIEW_ORIGIN ?? 'https://admin.eduvo.uz';
const SEC: Record<string, string> = { listening: 'L', reading: 'R', writing: 'W', speaking: 'S', rw: 'R&W', reading_writing: 'R&W', math: 'Math' };
const STATUS: Record<TestItem['status'], { t: string; bg: string; fg: string }> = {
  DRAFT: { t: 'Qoralama', bg: 'var(--hover)', fg: 'var(--ink2)' },
  PUBLISHED: { t: 'Nashr qilingan', bg: 'var(--okBg)', fg: 'var(--ok)' },
  ARCHIVED: { t: 'Arxiv', bg: 'var(--hover)', fg: 'var(--mut)' },
};
const th = { padding: '14px 10px', borderBottom: '1px solid var(--line)', fontWeight: 700 } as const;
const td = { padding: '12px 10px', borderBottom: '1px solid var(--line)' } as const;
type Act = 'publish' | 'unpublish' | 'archive' | 'restore';

export function TestsScreen() {
  const { can } = useAdminShell();
  const toast = useToast();
  const qc = useQueryClient();
  const [f, setF] = useUrlState({ family: 'ielts' });
  const fams = useQuery({ queryKey: ['am', 'families'], queryFn: adminApi.families });
  const family = f.family as ExamSlug;
  const fam = fams.data?.items.find((x) => x.family === family);
  const tests = useQuery({ queryKey: ['am', 'tests', family], queryFn: () => adminApi.tests(family), enabled: !!fams.data });
  const [importing, setImporting] = useState(false);
  const [confirm, setConfirm] = useState<{ t: TestItem; act: Act } | null>(null);
  const [siteConfirm, setSiteConfirm] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const owner = can('mock.settings');
  const refresh = () => { void qc.invalidateQueries({ queryKey: ['am', 'tests', family] }); void qc.invalidateQueries({ queryKey: ['am', 'families'] }); };

  async function setSite(status: 'open' | 'coming_soon') {
    setBusy('site');
    try {
      await adminApi.siteStatus(family, status);
      toast({ tone: 'ok', title: status === 'open' ? "O'quvchi saytida ochildi" : "O'quvchi saytida «Tez kunda»", text: fam?.label });
      refresh();
    } catch (e) {
      toast({ tone: 'err', title: 'Saqlanmadi', text: errText(e) });
    } finally {
      setBusy(null);
      setSiteConfirm(false);
    }
  }

  async function preview(t: TestItem) {
    const tab = window.open('about:blank', '_blank');
    try {
      const r = await adminApi.testPreview(t.id);
      const url = r.url ?? r.playerUrl ?? (r.attemptId ? `${PREVIEW_ORIGIN}/exam/${encodeURIComponent(r.attemptId)}?preview=${encodeURIComponent(r.token)}` : null);
      if (url && tab) tab.location.href = url;
      else tab?.close();
    } catch (e) {
      tab?.close();
      toast({ tone: 'err', title: "Ko'rib bo'lmadi", text: errText(e) });
    }
  }

  async function act(t: TestItem, a: Act) {
    setBusy(t.id);
    try {
      await adminApi.testAction(t.id, a);
      const done = { publish: 'Nashr qilindi', unpublish: 'Nashrdan olindi', archive: 'Arxivlandi', restore: 'Tiklandi' }[a];
      toast({ tone: 'ok', title: done, text: t.title });
      refresh();
    } catch (e) {
      const report = e instanceof AdminApiError ? (e.data.report as Array<{ level: string; message: string }> | undefined) : undefined;
      const first = report?.find((x) => x.level === 'error')?.message;
      toast({ tone: 'err', title: errText(e), text: first });
    } finally {
      setBusy(null);
      setConfirm(null);
    }
  }

  if (fams.isError && !fams.data) return <ErrorState flat title="Yuklab bo'lmadi" text={errText(fams.error)} onRetry={() => fams.refetch()} retrying={fams.isFetching} />;

  const live = fam?.siteStatus === 'open';
  const items = tests.data?.items ?? [];
  return (
    <>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="ma-tabs" role="tablist" aria-label="Imtihon" style={{ alignSelf: 'auto' }}>
          {!fams.data && [1, 2, 3].map((i) => <span key={i} className="ma-skel" style={{ width: 80, height: 36, borderRadius: 12 }} />)}
          {fams.data?.items.map((x) => (
            <button key={x.family} type="button" role="tab" aria-selected={x.family === family} onClick={() => setF({ family: x.family })} style={{ gap: 6 }}>
              {x.label}
              {!x.b2cReady && <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 999, background: 'var(--warnBg)', color: 'var(--warn)' }}>Tez kunda</span>}
            </button>
          ))}
        </div>
        <span style={{ flex: 1 }} />
        <Button size={40} onClick={() => setImporting(true)} disabled={!fam}>↑ Import</Button>
      </div>

      {fam && (
        <section style={{ borderRadius: 24, boxShadow: 'var(--raise)', padding: 20, display: 'flex', gap: '20px 32px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 200 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mut)' }}>O&apos;quvchi saytida</span>
            <div className="ma-seg ma-site" role="group" aria-label="O'quvchi saytida">
              <button type="button" aria-pressed={live} className="is-open" disabled={!owner || !fam.b2cReady || busy === 'site'}
                title={!fam.b2cReady ? "O'quvchi saytida bu imtihon hali tayyor emas" : !owner ? "Faqat Owner o'zgartiradi" : undefined}
                onClick={() => !live && setSite('open')}>Ochiq</button>
              <button type="button" aria-pressed={!live} className="is-soon" disabled={!owner || busy === 'site'} title={!owner ? "Faqat Owner o'zgartiradi" : undefined}
                onClick={() => live && setSiteConfirm(true)}>Tez kunda</button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mut)' }}>Nashr qilingan</span><b style={{ fontSize: 24 }}>{groupNum(fam.published)}</b></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mut)' }}>Qoralama</span><b style={{ fontSize: 24 }}>{groupNum(fam.drafts)}</b></div>
          {fam.noFreshLearners > 0 && live && (
            <div style={{ flex: 1, minWidth: 260, padding: '14px 16px', borderRadius: 16, background: 'var(--warnBg)', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <b style={{ fontSize: 14, color: 'var(--warn)' }}>{groupNum(fam.noFreshLearners)} o&apos;quvchida yangi test qolmagan</b>
              <span style={{ fontSize: 12, color: 'var(--ink2)', fontWeight: 600 }}>Barcha nashr qilingan testlarni ko&apos;rgan — keyingi urinishda NO_FRESH_TEST oladi. Yangi test nashr qiling.</span>
            </div>
          )}
        </section>
      )}

      {tests.isError && !tests.data ? (
        <ErrorState flat title="Yuklab bo'lmadi" text={errText(tests.error)} onRetry={() => tests.refetch()} retrying={tests.isFetching} />
      ) : tests.data && items.length === 0 ? (
        <div style={{ padding: '56px 24px', borderRadius: 20, background: 'var(--paper)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <b style={{ fontSize: 16 }}>Hali test yo&apos;q</b>
          <span style={{ fontSize: 13, color: 'var(--ink2)', maxWidth: 420 }}>Bu imtihon o&apos;quvchilarga &quot;Tez kunda&quot; sifatida ko&apos;rinadi. JSON + media zip yuklab birinchi testni qo&apos;shing.</span>
          <button type="button" className="ma-state-link" style={{ border: 0, color: 'var(--blue)' }} onClick={() => setImporting(true)}>Import</button>
        </div>
      ) : (
        <div style={{ borderRadius: 20, background: 'var(--paper)', overflowX: 'auto' }}>
          <table className="ma-table" style={{ minWidth: 1080 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--mut)', fontSize: 12 }}>
                <th style={{ ...th, padding: '14px 10px 14px 16px' }}>Nom</th><th style={th}>Versiya</th><th style={th}>Bo&apos;limlar</th><th style={{ ...th, textAlign: 'right' }}>Savollar</th><th style={th}>Holat</th>
                <th style={{ ...th, textAlign: 'right' }}>Urinishlar</th><th style={{ ...th, textAlign: 'right' }}>O&apos;rt. ball</th><th style={th}>Yaratildi</th><th style={{ ...th, padding: '14px 16px 14px 10px', textAlign: 'right' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {!tests.data && <SkeletonRows cols={9} n={5} />}
              {items.map((t) => {
                const s = STATUS[t.status];
                const main: Act = t.status === 'PUBLISHED' ? 'unpublish' : t.status === 'DRAFT' ? 'publish' : 'restore';
                const mainLabel = { publish: 'Nashr qilish', unpublish: 'Nashrdan olish', restore: 'Tiklash', archive: '' }[main];
                return (
                  <tr key={t.id}>
                    <td style={{ ...td, padding: '12px 10px 12px 16px', fontWeight: 700 }}>
                      {t.title}
                      {(t.errorCount > 0 || t.warnCount > 0) && (
                        <span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: t.errorCount ? 'var(--err)' : 'var(--warn)' }}>
                          {[t.errorCount ? `${t.errorCount} xato` : null, t.warnCount ? `${t.warnCount} ogohlantirish` : null].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </td>
                    <td style={{ ...td, color: 'var(--ink2)' }} className="ma-mono">{t.configVersion}</td>
                    <td style={{ ...td, color: 'var(--ink2)', fontWeight: 600 }}>{t.sections.map((x) => SEC[x] ?? x).join(' · ')}</td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{groupNum(t.questionCount)}</td>
                    <td style={td}><span style={{ fontSize: 12, fontWeight: 800, padding: '4px 10px', borderRadius: 999, background: s.bg, color: s.fg }}>{s.t}</span></td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{groupNum(t.attemptsB2c)}</td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 800 }}>{t.avgScore ? (family === 'ielts' ? t.avgScore.value.toFixed(1) : Math.round(t.avgScore.value)) : '—'}</td>
                    <td style={{ ...td, color: 'var(--ink2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{dayMonth(t.createdAt)}</td>
                    <td style={{ ...td, padding: '12px 16px 12px 10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: 12, fontWeight: 700 }}>
                        <button type="button" className="ma-linkbtn" onClick={() => preview(t)}>Ko&apos;rish</button>
                        <button type="button" className="ma-linkbtn" disabled={busy === t.id} style={{ color: main === 'publish' ? 'var(--ok)' : 'var(--ink2)' }} onClick={() => setConfirm({ t, act: main })}>{mainLabel}</button>
                        {t.status !== 'ARCHIVED' && <button type="button" className="ma-linkbtn" disabled={busy === t.id} style={{ color: 'var(--ink2)' }} onClick={() => setConfirm({ t, act: 'archive' })}>Arxivlash</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ActConfirm c={confirm} busy={!!confirm && busy === confirm.t.id} onClose={() => setConfirm(null)} onGo={() => confirm && act(confirm.t, confirm.act)} />
      <Dialog open={siteConfirm} onClose={() => setSiteConfirm(false)} busy={busy === 'site'} gap={14} title={`${fam?.label ?? ''} — «Tez kunda»`}
        actions={<>
          <Button variant="secondary" size={42} style={{ color: 'var(--ink2)' }} onClick={() => setSiteConfirm(false)} disabled={busy === 'site'}>Bekor qilish</Button>
          <Button variant="danger-solid" size={42} onClick={() => setSite('coming_soon')} loading={busy === 'site'}>Tez kunda qilish</Button>
        </>}>
        <span className="ma-dialog-effect">Yangi urinish boshlab bo&apos;lmaydi</span>
        <span style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.5 }}>O&apos;quvchi saytida imtihon «Tez kunda» bo&apos;ladi, mahsulotlar sotilmaydi. Ishlayotgan urinishlar davom etadi, kreditlar saqlanadi. B2B markazlarga ta&apos;sir qilmaydi.</span>
      </Dialog>
      {importing && fam && <ImportDialog fam={fam} onClose={() => setImporting(false)} onImported={() => { refresh(); }} />}
    </>
  );
}

const ACT_TEXT: Record<Act, { title: string; body: string; cta: string; danger: boolean }> = {
  publish: { title: 'Testni nashr qilish', body: "Test o'quvchi saytida va B2B markazlarda ham ochiladi — test banki umumiy.", cta: 'Nashr qilish', danger: false },
  unpublish: { title: 'Nashrdan olish', body: "Test qoralamaga qaytadi: o'quvchi saytida ham, B2B markazlarda ham yangi urinishda chiqmaydi. Ishlayotgan urinishlar davom etadi.", cta: 'Nashrdan olish', danger: true },
  archive: { title: 'Arxivlash', body: "Test bankdan chiqadi — o'quvchi saytida ham, B2B markazlarda ham. Ishlayotgan urinishlar davom etadi. Keyin tiklash mumkin.", cta: 'Arxivlash', danger: true },
  restore: { title: 'Tiklash', body: 'Test qoralama sifatida qaytadi. Nashr qilish alohida amal.', cta: 'Tiklash', danger: false },
};

function ActConfirm({ c, busy, onClose, onGo }: { c: { t: TestItem; act: Act } | null; busy: boolean; onClose: () => void; onGo: () => void }) {
  const x = c ? ACT_TEXT[c.act] : null;
  return (
    <Dialog open={!!c} onClose={onClose} busy={busy} gap={14} title={x?.title ?? ''}
      actions={<>
        <Button variant="secondary" size={42} style={{ color: 'var(--ink2)' }} onClick={onClose} disabled={busy}>Bekor qilish</Button>
        <Button variant={x?.danger ? 'danger-solid' : 'primary'} size={42} onClick={onGo} loading={busy}>{x?.cta}</Button>
      </>}>
      <b style={{ fontSize: 15 }}>{c?.t.title}</b>
      <span style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.5 }}>{x?.body}</span>
    </Dialog>
  );
}

const fileSize = (b: number) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const SECTION_NAME: Record<string, string> = { listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking', rw: 'Reading & Writing', reading_writing: 'Reading & Writing', math: 'Math' };

function Drop({ label, accept, file, onFile, max }: { label: string; accept: string; file: File | null; onFile: (f: File | null) => void; max: number }) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const tooBig = !!file && file.size > max;
  return (
    <div
      role="button" tabIndex={0}
      onClick={() => ref.current?.click()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ref.current?.click(); } }}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); onFile(e.dataTransfer.files[0] ?? null); }}
      style={{ padding: 24, borderRadius: 16, boxShadow: 'var(--inset)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center', border: `2px dashed ${over ? 'var(--blue)' : 'var(--line)'}`, cursor: 'pointer' }}>
      <b style={{ fontSize: 14 }}>{label}</b>
      {file
        ? <span style={{ fontSize: 12, color: tooBig ? 'var(--err)' : 'var(--ok)', fontWeight: 700 }}>{tooBig ? `✕ ${file.name} · ${fileSize(file.size)} — juda katta (≤ ${fileSize(max)})` : `✓ ${file.name} · ${fileSize(file.size)}`}</span>
        : <span style={{ fontSize: 12, color: 'var(--mut)', fontWeight: 700 }}>Faylni tanlang yoki shu yerga tashlang</span>}
      <input ref={ref} type="file" accept={accept} hidden onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
    </div>
  );
}

function ImportDialog({ fam, onClose, onImported }: { fam: TestFamily; onClose: () => void; onImported: () => void }) {
  const [json, setJson] = useState<File | null>(null);
  const [zip, setZip] = useState<File | null>(null);
  const [stage, setStage] = useState<ImportStage | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const stageRef = useRef<string | null>(null);
  stageRef.current = done ? null : stage?.stageId ?? null;
  useEffect(() => () => { if (stageRef.current) void adminApi.importDrop(stageRef.current).catch(() => undefined); }, []);
  const step = done ? 2 : stage ? 1 : 0;
  const JSON_MAX = 5 * 1024 * 1024, ZIP_MAX = 300 * 1024 * 1024;
  const valid = !!json && json.size <= JSON_MAX && (!zip || zip.size <= ZIP_MAX);
  const errors = stage?.report.filter((r) => r.level === 'error').length ?? 0;

  async function dryRun() {
    if (!valid || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append('test', json!);
      if (zip) fd.append('media', zip);
      setStage(await adminApi.importStage(fam.family, fd));
    } catch (e) {
      setErr(errText(e));
    } finally {
      setBusy(false);
    }
  }
  async function back() {
    if (stage) void adminApi.importDrop(stage.stageId).catch(() => undefined);
    setStage(null);
    setErr(null);
  }
  async function commit() {
    if (!stage || busy) return;
    setBusy(true);
    setErr(null);
    try {
      await adminApi.importCommit(stage.stageId);
      setDone(true);
      onImported();
    } catch (e) {
      setErr(errText(e));
      if (e instanceof AdminApiError && e.code === 'STAGE_EXPIRED') setStage(null);
    } finally {
      setBusy(false);
    }
  }

  const stepStyle = (i: number) => ({
    flex: 1, padding: '8px 10px', borderRadius: 10, textAlign: 'center' as const,
    background: i === step ? 'var(--bg)' : i < step ? 'var(--okBg)' : 'transparent',
    color: i === step ? 'var(--blue)' : i < step ? 'var(--ok)' : 'var(--mut)', boxShadow: i === step ? 'var(--raise-sm)' : 'none',
  });
  return (
    <Dialog open onClose={onClose} busy={busy} width={600} gap={16}
      title={<span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ flex: 1 }}>Test import · {fam.label}</span><IconButton label="Yopish" size={36} onClick={onClose} disabled={busy}>✕</IconButton></span>}>
      <div style={{ display: 'flex', gap: 8, fontSize: 12, fontWeight: 800 }}>
        {['1 · Fayllar', '2 · Dry-run hisobot', '3 · Qoralama'].map((n, i) => <span key={n} style={stepStyle(i)}>{n}</span>)}
      </div>
      {step === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Drop label="test.json" accept=".json,application/json" file={json} onFile={setJson} max={JSON_MAX} />
          <Drop label="media.zip" accept=".zip,application/zip" file={zip} onFile={setZip} max={ZIP_MAX} />
          {err && <span className="ma-field-error" role="alert">{err}</span>}
          <Button size={44} style={{ height: 46, borderRadius: 14 }} onClick={dryRun} loading={busy} disabled={!valid}>{busy ? 'Yuklanmoqda…' : 'Tekshirish (dry-run)'}</Button>
        </div>
      )}
      {step === 1 && stage && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(1, Math.min(4, stage.sectionCounts.length))},1fr)`, gap: 8 }}>
            {stage.sectionCounts.map((c) => (
              <div key={c.section} style={{ padding: 10, borderRadius: 12, background: 'var(--paper)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--mut)' }}>{SECTION_NAME[c.section] ?? c.section}</span>
                <b style={{ fontSize: 16 }}>{c.questions ? `${c.questions} savol` : c.tasks ? `${c.tasks} task` : `${c.parts} part`}</b>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 14, background: 'var(--paper)', overflow: 'hidden', maxHeight: '40vh', overflowY: 'auto' }}>
            {stage.report.map((c, i) => {
              const k = c.level;
              return (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '11px 14px', borderBottom: '1px solid var(--line)', alignItems: 'flex-start' }}>
                  <span style={{ width: 22, height: 22, borderRadius: 7, background: k === 'ok' ? 'var(--okBg)' : k === 'warn' ? 'var(--warnBg)' : 'var(--errBg)', color: k === 'ok' ? 'var(--ok)' : k === 'warn' ? 'var(--warn)' : 'var(--err)', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} aria-hidden="true">{k === 'ok' ? '✓' : k === 'warn' ? '!' : '✕'}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{c.message}</span>
                    {c.path && <span style={{ fontSize: 12, color: 'var(--mut)', fontWeight: 600 }}>{c.path}</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <span style={{ fontSize: 12, color: 'var(--ink2)', fontWeight: 600 }}>
            {errors > 0 ? `${errors} ta xato tuzatilmaguncha import qilib bo'lmaydi. ` : ''}Ogohlantirishlar importni to&apos;xtatmaydi.
          </span>
          {err && <span className="ma-field-error" role="alert">{err}</span>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button variant="secondary" size={42} style={{ color: 'var(--ink2)' }} onClick={back} disabled={busy}>Fayllarni almashtirish</Button>
            <Button size={42} onClick={commit} loading={busy} disabled={!stage.ok || errors > 0}>Qoralama sifatida import</Button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ padding: '14px 16px', borderRadius: 14, background: 'var(--okBg)', alignSelf: 'stretch' }}>
            <b style={{ color: 'var(--ok)' }}>Test qoralama sifatida qo&apos;shildi</b>
            <span style={{ display: 'block', fontSize: 13, color: 'var(--ink2)', marginTop: 2 }}>Ro&apos;yxatda &quot;Qoralama&quot; holatida. Tekshirib, nashr qiling.</span>
          </div>
          <Button size={42} onClick={onClose} style={{ alignSelf: 'flex-end' }}>Yopish</Button>
        </div>
      )}
    </Dialog>
  );
}
