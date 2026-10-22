'use client';
/**
 * Learner Profile → "Reyting" card (leaderboard-design.md §9.1): state chip, points, the name shown on
 * the board; remove (reason + note, audit) / restore / approve a flagged name. Removing keeps the
 * learner's points, streak and badges — only the public board changes.
 */
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-mock/api';
import { errText } from '@/lib/admin-mock/errors';
import { dateTime, groupNum } from '@/lib/admin-mock/format';
import type { AdminLeaderboard, LbAdminState, LbRemoveReason, LearnerDetailRes } from '@/lib/admin-mock/types';
import { Button } from '../ui/button';
import { StatusChip, type Tone } from '../ui/chip';
import { Dialog, DialogText } from '../ui/dialog';
import { useToast } from '../ui/toast';

export const LB_STATE: Record<LbAdminState, { t: string; tone: Tone }> = {
  visible: { t: "Ko'rinadi", tone: 'ok' },
  hidden_by_learner: { t: "O'zi yashirgan", tone: 'neutral' },
  no_name: { t: "Ism kiritilmagan", tone: 'neutral' },
  name_flagged: { t: 'Ism tekshiruvda', tone: 'warn' },
  removed: { t: 'Olib tashlangan', tone: 'neutral' },
};
const LEVEL: Record<string, string> = { beginner: 'Boshlovchi', striver: 'Intiluvchan', scholar: 'Bilimdon', star: 'Yulduz', master: 'Usta' };
const REASONS: Array<{ v: LbRemoveReason; t: string }> = [
  { v: 'name', t: 'Nomaqbul ism' }, { v: 'fraud', t: 'Firibgarlik shubhasi' }, { v: 'request', t: "O'quvchi so'rovi" }, { v: 'other', t: 'Boshqa' },
];
const card = { borderRadius: 24, boxShadow: 'var(--raise)', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 } as const;

export function LeaderboardCard({ d }: { d: LearnerDetailRes }) {
  const qc = useQueryClient();
  const toast = useToast();
  const lb: AdminLeaderboard | undefined = d.leaderboard;
  const [dlg, setDlg] = useState<'remove' | 'restore' | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  if (!lb) return null;
  const s = LB_STATE[lb.state] ?? { t: lb.state, tone: 'neutral' as Tone };
  const id = d.learner.id;
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ['am', 'learner', id] });
    void qc.invalidateQueries({ queryKey: ['am', 'learners'] });
  };
  async function approve() {
    setBusy('approve');
    try { await adminApi.lbApproveName(id); toast({ tone: 'ok', title: 'Ism tasdiqlandi' }); refresh(); }
    catch (e) { toast({ tone: 'err', title: 'Saqlanmadi', text: errText(e) }); }
    finally { setBusy(null); }
  }
  const r = lb.removed;
  return (
    <section style={card} aria-label="Reyting">
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Reyting</h3>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', fontSize: 13, fontWeight: 600, color: 'var(--ink2)' }}>
        <span>Holat:</span><StatusChip tone={s.tone}>{s.t}</StatusChip>
        <span>Bu hafta: <b style={{ color: 'var(--ink)' }}>{groupNum(lb.weekPoints)} ball</b> · Umrbod: <b style={{ color: 'var(--ink)' }}>{groupNum(lb.lifetimePoints)} ball</b>{lb.levelKey ? ` · ${LEVEL[lb.levelKey] ?? lb.levelKey}` : ''}</span>
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)' }}>Ism reytingda: <b style={{ color: 'var(--ink)' }}>{lb.displayName ? `"${lb.displayName}"` : '—'}</b></span>
      {lb.state === 'removed' && r && (
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mut)' }}>
          Sabab: {REASONS.find((x) => x.v === r.reason)?.t ?? r.reason}{r.note ? ` — ${r.note}` : ''} · {dateTime(r.at)}{r.by ? ` · ${r.by}` : ''}
        </span>
      )}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {lb.state === 'name_flagged' && <Button variant="secondary" size={40} style={{ fontSize: 13 }} onClick={approve} loading={busy === 'approve'}>Ismni tasdiqlash</Button>}
        {lb.state === 'removed'
          ? <Button variant="secondary" size={40} style={{ fontSize: 13 }} onClick={() => setDlg('restore')}>Reytingga qaytarish</Button>
          : <Button variant="danger" size={40} style={{ fontSize: 13 }} onClick={() => setDlg('remove')}>Reytingdan olib tashlash</Button>}
      </div>
      <RemoveDialog open={dlg === 'remove'} id={id} onClose={() => setDlg(null)} onDone={() => { setDlg(null); refresh(); }} />
      <RestoreDialog open={dlg === 'restore'} id={id} onClose={() => setDlg(null)} onDone={() => { setDlg(null); refresh(); }} />
    </section>
  );
}

function RemoveDialog({ open, id, onClose, onDone }: { open: boolean; id: string; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const [reason, setReason] = useState<LbRemoveReason>('name');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { if (open) { setReason('name'); setNote(''); setErr(null); } }, [open]);
  async function submit() {
    setBusy(true); setErr(null);
    try {
      await adminApi.lbRemove(id, { reason, ...(note.trim() ? { note: note.trim() } : {}) });
      toast({ tone: 'ok', title: 'Reytingdan olib tashlandi' });
      onDone();
    } catch (e) { setErr(errText(e)); } finally { setBusy(false); }
  }
  return (
    <Dialog open={open} onClose={onClose} busy={busy} gap={14} title="Reytingdan olib tashlansinmi?"
      actions={<>
        <Button variant="secondary" size={42} style={{ color: 'var(--ink2)' }} onClick={onClose} disabled={busy}>Bekor qilish</Button>
        <Button variant="secondary" size={42} style={{ background: 'var(--ink)', color: 'var(--bg)', boxShadow: 'none', fontWeight: 800 }} onClick={submit} loading={busy}>Olib tashlash</Button>
      </>}>
      <DialogText>O&apos;quvchi reytingda ko&apos;rinmaydi va o&apos;rinlar qayta hisoblanadi. Ballari, seriyasi va nishonlari saqlanadi. Audit jurnaliga yoziladi.</DialogText>
      <div className="ma-seg" role="group" aria-label="Sabab" style={{ flexWrap: 'wrap' }}>
        {REASONS.map((o) => <button key={o.v} type="button" style={{ flex: '1 1 auto', height: 36 }} aria-pressed={o.v === reason} onClick={() => setReason(o.v)}>{o.t}</button>)}
      </div>
      <textarea rows={2} className="ma-textarea" placeholder="Izoh (ixtiyoriy)" value={note} maxLength={200} onChange={(ev) => setNote(ev.target.value)} aria-label="Izoh (ixtiyoriy)" />
      {err && <span className="ma-field-error" role="alert">{err}</span>}
    </Dialog>
  );
}

function RestoreDialog({ open, id, onClose, onDone }: { open: boolean; id: string; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { if (open) setErr(null); }, [open]);
  async function submit() {
    setBusy(true); setErr(null);
    try { await adminApi.lbRestore(id); toast({ tone: 'ok', title: 'Reytingga qaytarildi' }); onDone(); }
    catch (e) { setErr(errText(e)); } finally { setBusy(false); }
  }
  return (
    <Dialog open={open} onClose={onClose} busy={busy} gap={14} title="Reytingga qaytarilsinmi?"
      actions={<>
        <Button variant="secondary" size={42} style={{ color: 'var(--ink2)' }} onClick={onClose} disabled={busy}>Bekor qilish</Button>
        <Button size={42} onClick={submit} loading={busy}>Qaytarish</Button>
      </>}>
      {err && <span className="ma-field-error" role="alert">{err}</span>}
    </Dialog>
  );
}
