'use client';
/**
 * Admin Settings.dc.html — G3 admins (invite, role/status, resend invite, 2FA reset), G1/G2 payment
 * methods (Paddle read-only, manual transfer details), exam toggles. Owner only (AdminPage gate).
 */
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-mock/api';
import { AdminApiError, newIdemKey } from '@/lib/admin-mock/http';
import { errText, loadErrText } from '@/lib/admin-mock/errors';
import { ago, dayMonth } from '@/lib/admin-mock/format';
import type { AdminMember, MockRole, SettingsRes } from '@/lib/admin-mock/types';
import { useAdminShell } from '../shell/context';
import { Button } from '../ui/button';
import { Toggle } from '../ui/controls';
import { Dialog } from '../ui/dialog';
import { FilterPill } from '../ui/filters';
import { ErrorState } from '../ui/state';
import { SkeletonRows } from '../ui/table';
import { useToast } from '../ui/toast';

const card = { borderRadius: 24, boxShadow: 'var(--raise)', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 } as const;
const h3 = { margin: 0, fontSize: 15, fontWeight: 800 } as const;
const ROLE: Record<MockRole, { t: string; bg: string; fg: string; perms: string }> = {
  owner: { t: 'Owner', bg: 'var(--blue)', fg: '#fff', perms: 'Hammasi' },
  operator: { t: 'Operator', bg: 'var(--okBg)', fg: 'var(--ok)', perms: "To'lovlar, o'quvchilar, murojaatlar" },
  content: { t: 'Kontent', bg: 'var(--aiBg)', fg: 'var(--ai)', perms: 'Testlar' },
};
const PADDLE: Array<{ k: SettingsRes['paddle']['state']; l: string; c: string }> = [
  { k: 'live', l: 'Live', c: 'var(--ok)' }, { k: 'sandbox', l: 'Sandbox', c: 'var(--warn)' }, { k: 'not_configured', l: 'Sozlanmagan', c: 'var(--err)' },
];

export function SettingsScreen() {
  const s = useQuery({ queryKey: ['am', 'settings'], queryFn: adminApi.settings });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Admins />
      {s.isError && !s.data ? (
        <ErrorState flat title="Sozlamalarni yuklab bo'lmadi" text={loadErrText(s.error)} onRetry={() => s.refetch()} retrying={s.isFetching} />
      ) : !s.data ? (
        <><span className="ma-skel on-bg" style={{ height: 300, borderRadius: 24 }} /><span className="ma-skel on-bg" style={{ height: 160, borderRadius: 24 }} /></>
      ) : (
        <>
          <Payments s={s.data} />
          <ExamToggles s={s.data} />
        </>
      )}
    </div>
  );
}

/* ---------- admins (G3) ---------- */

type Pending = { a: AdminMember; kind: 'role'; role: MockRole } | { a: AdminMember; kind: 'disable' | 'enable' | 'reset2fa' | 'resend' };

function Admins() {
  const qc = useQueryClient();
  const toast = useToast();
  const { me } = useAdminShell();
  const q = useQuery({ queryKey: ['am', 'admins'], queryFn: adminApi.admins });
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MockRole>('operator');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  // one key per invite attempt: a retried click after a network error reuses it, a success starts a new one
  const [idem, setIdem] = useState(newIdemKey);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setErr("Email noto'g'ri."); return; }
    setBusy(true);
    setErr(null);
    try {
      await adminApi.inviteAdmin({ email: v, role }, idem);
      toast({ tone: 'ok', title: 'Taklif yuborildi', text: v });
      setEmail('');
      setIdem(newIdemKey());
      void qc.invalidateQueries({ queryKey: ['am', 'admins'] });
    } catch (e2) {
      setErr(errText(e2));
    } finally {
      setBusy(false);
    }
  }

  const items = q.data?.items ?? [];
  return (
    <section style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}><h3 style={{ ...h3, flex: 1 }}>Adminlar va rollar</h3></div>
      <form style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }} onSubmit={invite} noValidate>
        <input className={`ma-input${err ? ' is-error' : ''}`} style={{ flex: 1, minWidth: 200, width: 'auto', height: 42, borderRadius: 12 }} placeholder="email@eduvo.uz" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(null); }} aria-label="Taklif qilinadigan email" maxLength={254} />
        <select className="ma-select" style={{ width: 'auto' }} value={role} onChange={(e) => setRole(e.target.value as MockRole)} aria-label="Rol">
          <option value="operator">Operator</option><option value="content">Kontent</option><option value="owner">Owner</option>
        </select>
        <Button type="submit" size={42} style={{ fontSize: 13 }} loading={busy}>Taklif yuborish</Button>
      </form>
      {err && <span className="ma-field-error" role="alert" style={{ marginTop: -6 }}>{err}</span>}
      {q.isError && !q.data ? (
        <ErrorState flat title="Yuklab bo'lmadi" text={loadErrText(q.error)} onRetry={() => q.refetch()} retrying={q.isFetching} />
      ) : (
        <div style={{ borderRadius: 16, background: 'var(--paper)', overflowX: 'auto' }}>
          <table className="ma-table" style={{ minWidth: 680 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--mut)', fontSize: 12 }}>
                <th style={{ padding: '12px 16px' }}>Admin</th><th>Rol</th><th>Ruxsatlar</th><th>2FA</th><th>Oxirgi kirish</th><th style={{ padding: '12px 16px 12px 10px' }} aria-label="Amallar" />
              </tr>
            </thead>
            <tbody>
              {!q.data && <SkeletonRows cols={6} n={3} />}
              {items.map((a) => {
                const r = ROLE[a.role];
                const invited = a.status === 'invited';
                const self = a.id === me?.user.id;
                return (
                  <tr key={a.id} style={{ opacity: a.status === 'disabled' ? 0.55 : 1 }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <b>{invited ? a.email : a.fullName ?? a.email}</b>
                        <span style={{ color: 'var(--ink2)', fontWeight: 600 }}>
                          {invited ? `Taklif yuborilgan${a.invitedAt ? ` · ${dayMonth(a.invitedAt)}` : ''}` : a.status === 'disabled' ? `${a.email} · o'chirilgan` : a.email}
                        </span>
                      </div>
                    </td>
                    <td><span style={{ fontSize: 12, fontWeight: 800, padding: '4px 10px', borderRadius: 999, background: r.bg, color: r.fg }}>{r.t}</span></td>
                    <td style={{ color: 'var(--ink2)', fontWeight: 600 }}>{r.perms}</td>
                    <td style={{ fontWeight: 800, color: a.twoFactorEnabled ? 'var(--ok)' : 'var(--mut)' }}>{a.twoFactorEnabled ? '✓' : '—'}</td>
                    <td style={{ color: 'var(--ink2)', fontWeight: 600 }}>{a.lastLoginAt ? ago(a.lastLoginAt) : '—'}</td>
                    <td style={{ padding: '12px 16px 12px 10px', textAlign: 'right' }}>
                      {!a.isPlatformOwner && !self && (
                        <FilterPill label="" value="⋯" align="right" ariaLabel={`${a.fullName ?? a.email} — amallar`}>
                          {(close) => (
                            <div role="menu" style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 220 }}>
                              {(['owner', 'operator', 'content'] as MockRole[]).filter((x) => x !== a.role).map((x) => (
                                <button key={x} type="button" role="menuitem" className="ma-filter-opt" onClick={() => { close(); setPending({ a, kind: 'role', role: x }); }}>Rol: {ROLE[x].t}</button>
                              ))}
                              {invited && <button type="button" role="menuitem" className="ma-filter-opt" onClick={() => { close(); setPending({ a, kind: 'resend' }); }}>Taklifni qayta yuborish</button>}
                              {!invited && a.twoFactorEnabled && <button type="button" role="menuitem" className="ma-filter-opt" onClick={() => { close(); setPending({ a, kind: 'reset2fa' }); }}>2FA&apos;ni qayta o&apos;rnatish</button>}
                              {a.status === 'disabled'
                                ? <button type="button" role="menuitem" className="ma-filter-opt" onClick={() => { close(); setPending({ a, kind: 'enable' }); }}>Faollashtirish</button>
                                : <button type="button" role="menuitem" className="ma-filter-opt" style={{ color: 'var(--err)' }} onClick={() => { close(); setPending({ a, kind: 'disable' }); }}>O&apos;chirish (kirish yopiladi)</button>}
                            </div>
                          )}
                        </FilterPill>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <AdminActionDialog p={pending} onClose={() => setPending(null)} />
    </section>
  );
}

function AdminActionDialog({ p, onClose }: { p: Pending | null; onClose: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => setErr(null), [p]);
  if (!p) return null;
  const who = p.a.fullName ?? p.a.email;
  const cfg = {
    role: { title: 'Rolni o\'zgartirish', effect: p.kind === 'role' ? `${who} — ${ROLE[p.role].t}` : '', body: p.kind === 'role' && p.role === 'owner' ? "Owner hamma narsaga — narxlar, to'lov rekvizitlari, adminlarga — ruxsat oladi. Joriy sessiyalari darhol yopiladi." : "Joriy sessiyalari darhol yopiladi — qayta kirishi kerak bo'ladi.", cta: "O'zgartirish", danger: false },
    disable: { title: 'Adminni o\'chirish', effect: `${who} kira olmaydi`, body: 'Barcha sessiyalari darhol yopiladi. Keyin qayta faollashtirish mumkin.', cta: "O'chirish", danger: true },
    enable: { title: 'Faollashtirish', effect: `${who} yana kira oladi`, body: 'Kirishda parol va 2FA so\'raladi.', cta: 'Faollashtirish', danger: false },
    reset2fa: { title: '2FA\'ni qayta o\'rnatish', effect: `${who} 2FA'ni qaytadan ulaydi`, body: "Eski authenticator kodi ishlamay qoladi, sessiyalari yopiladi. Keyingi kirishda QR kod ko'rsatiladi.", cta: 'Qayta o\'rnatish', danger: true },
    resend: { title: 'Taklifni qayta yuborish', effect: p.a.email, body: 'Eski havola bekor bo\'ladi, yangi havola 72 soat amal qiladi.', cta: 'Yuborish', danger: false },
  }[p.kind];

  async function go() {
    if (!p) return;
    setBusy(true);
    setErr(null);
    try {
      if (p.kind === 'role') await adminApi.updateAdmin(p.a.id, { role: p.role });
      else if (p.kind === 'disable') await adminApi.updateAdmin(p.a.id, { status: 'disabled' });
      else if (p.kind === 'enable') await adminApi.updateAdmin(p.a.id, { status: 'active' });
      else if (p.kind === 'reset2fa') await adminApi.reset2fa(p.a.id);
      else await adminApi.resendInvite(p.a.id);
      toast({ tone: 'ok', title: 'Saqlandi', text: cfg.effect });
      void qc.invalidateQueries({ queryKey: ['am', 'admins'] });
      onClose();
    } catch (e) {
      setErr(errText(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open onClose={onClose} busy={busy} gap={14} title={cfg.title}
      actions={<>
        <Button variant="secondary" size={42} style={{ color: 'var(--ink2)' }} onClick={onClose} disabled={busy}>Bekor qilish</Button>
        <Button variant={cfg.danger ? 'danger-solid' : 'primary'} size={42} onClick={go} loading={busy}>{cfg.cta}</Button>
      </>}>
      <span className="ma-dialog-effect" style={cfg.danger ? undefined : { background: 'var(--paper)', color: 'var(--ink)' }}>{cfg.effect}</span>
      <span style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.5 }}>{cfg.body}</span>
      {err && <span className="ma-field-error" role="alert">{err}</span>}
    </Dialog>
  );
}

/* ---------- payment methods (G1/G2) ---------- */

function luhn(d: string) {
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = +d[d.length - 1 - i];
    if (i % 2) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
  }
  return sum % 10 === 0;
}
const fmtCard = (v: string) => v.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();

function Payments({ s }: { s: SettingsRes }) {
  const qc = useQueryClient();
  const toast = useToast();
  const m = s.manualTransfer;
  const [cardNo, setCard] = useState(fmtCard(m.cardNumber ?? ''));
  const [holder, setHolder] = useState(m.cardHolder ?? '');
  const [tg, setTg] = useState(m.telegram ?? '');
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  useEffect(() => { setCard(fmtCard(m.cardNumber ?? '')); setHolder(m.cardHolder ?? ''); setTg(m.telegram ?? ''); }, [m.cardNumber, m.cardHolder, m.telegram]);
  const digits = cardNo.replace(/\D/g, '');
  const dirty = digits !== (m.cardNumber ?? '').replace(/\D/g, '') || holder.trim() !== (m.cardHolder ?? '') || tg.trim() !== (m.telegram ?? '');

  async function save() {
    const e: Record<string, string> = {};
    if (digits && (digits.length < 16 || digits.length > 19 || !luhn(digits))) e.card = "Karta raqami noto'g'ri.";
    if (holder.trim().length > 80) e.holder = '80 belgidan oshmasin.';
    if (tg.trim() && !/^@?[A-Za-z0-9_]{5,32}$/.test(tg.trim())) e.tg = 'Telegram: 5–32 belgi (lotin harf, raqam, _).';
    setErrs(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      // only changed keys: "" removes a channel, untouched keys keep their source (DB or env) — contract §20.7
      const mt: Record<string, string> = {};
      if (digits !== (m.cardNumber ?? '').replace(/\D/g, '')) mt.cardNumber = digits;
      if (holder.trim() !== (m.cardHolder ?? '')) mt.cardHolder = holder.trim();
      if (tg.trim() !== (m.telegram ?? '')) mt.telegram = tg.trim();
      const r = await adminApi.saveSettings({ manualTransfer: mt });
      qc.setQueryData(['am', 'settings'], r);
      const last4 = (r.manualTransfer.cardNumber ?? '').replace(/\D/g, '').slice(-4);
      toast({ tone: r.manualTransfer.configured ? 'ok' : 'warn', title: last4 ? `Rekvizitlar saqlandi · ${(r.manualTransfer.cardNumber ?? '').replace(/\D/g, '').slice(0, 4)} •••• ${last4}` : 'Rekvizitlar saqlandi', text: r.manualTransfer.configured ? undefined : "Karta va Telegram bo'sh — mahalliy o'tkazma o'quvchilarga ko'rinmaydi." });
    } catch (e2) {
      const fields = e2 instanceof AdminApiError ? (e2.data.fields as Array<{ field: string }> | undefined) : undefined;
      if (fields?.length) setErrs(Object.fromEntries(fields.map((f) => [f.field.includes('card') ? 'card' : f.field.includes('telegram') ? 'tg' : 'holder', "Qiymat noto'g'ri."])));
      else toast({ tone: 'err', title: 'Saqlanmadi', text: errText(e2) });
    } finally {
      setBusy(false);
    }
  }

  const lab = { fontSize: 12, fontWeight: 700, color: 'var(--ink2)' } as const;
  const inp = { height: 44, borderRadius: 12, fontWeight: 700 } as const;
  return (
    <section style={card}>
      <h3 style={h3}>To&apos;lov usullari</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 16, background: 'var(--paper)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 200 }}>
          <b style={{ fontSize: 14 }}>Paddle (karta)</b>
          <span style={{ fontSize: 12, color: 'var(--mut)', fontWeight: 600 }}>USD / EUR · xalqaro o&apos;quvchilar</span>
        </div>
        <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 12, boxShadow: 'var(--inset)' }} role="img" aria-label={`Paddle holati: ${PADDLE.find((x) => x.k === s.paddle.state)?.l}`} title="Server sozlamasi (env) — bu yerdan o'zgarmaydi">
          {PADDLE.map((p) => {
            const on = p.k === s.paddle.state;
            return <span key={p.k} style={{ height: 32, padding: '0 12px', borderRadius: 9, background: on ? 'var(--bg)' : 'transparent', boxShadow: on ? 'var(--raise-sm)' : 'none', color: on ? p.c : 'var(--mut)', fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center' }}>{p.l}</span>;
          })}
        </div>
      </div>
      <div style={{ padding: 16, borderRadius: 16, background: 'var(--paper)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <b style={{ fontSize: 14 }}>Mahalliy o&apos;tkazma rekvizitlari</b>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={lab}>Karta raqami</span>
            <input className={`ma-input ma-mono${errs.card ? ' is-error' : ''}`} style={{ ...inp, fontSize: 14 }} inputMode="numeric" autoComplete="off" value={cardNo} onChange={(e) => setCard(fmtCard(e.target.value))} />
            {errs.card && <span className="ma-field-error s-sm">{errs.card}</span>}
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={lab}>Karta egasi</span>
            <input className={`ma-input${errs.holder ? ' is-error' : ''}`} style={inp} value={holder} maxLength={80} autoComplete="off" onChange={(e) => setHolder(e.target.value)} />
            {errs.holder && <span className="ma-field-error s-sm">{errs.holder}</span>}
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={lab}>Telegram</span>
            <input className={`ma-input${errs.tg ? ' is-error' : ''}`} style={inp} value={tg} maxLength={32} autoComplete="off" placeholder="@eduvo_pay" onChange={(e) => setTg(e.target.value)} />
            {errs.tg && <span className="ma-field-error s-sm">{errs.tg}</span>}
          </label>
        </div>
        {dirty && (
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button variant="secondary" size={40} style={{ color: 'var(--ink2)' }} onClick={() => { setCard(fmtCard(m.cardNumber ?? '')); setHolder(m.cardHolder ?? ''); setTg(m.telegram ?? ''); setErrs({}); }} disabled={busy}>Bekor qilish</Button>
            <Button size={40} onClick={save} loading={busy}>Saqlash</Button>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {s.comingSoonMethods.map((x) => (
          <div key={x} style={{ flex: 1, minWidth: 200, padding: '14px 16px', borderRadius: 16, boxShadow: 'var(--inset)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <b style={{ fontSize: 14, color: 'var(--ink2)' }}>{x === 'click' ? 'Click' : x === 'payme' ? 'Payme' : x}</b>
            <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 999, background: 'var(--warnBg)', color: 'var(--warn)' }}>Tez kunda</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- exam settings ---------- */

function ExamToggles({ s }: { s: SettingsRes }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  async function set(key: 'freeSectionEnabled' | 'unlimitedEnabled', v: boolean) {
    setBusy(key);
    try {
      const r = await adminApi.saveSettings({ [key]: v });
      qc.setQueryData(['am', 'settings'], r);
      toast({ tone: 'ok', title: v ? 'Yoqildi' : "O'chirildi", text: key === 'freeSectionEnabled' ? "Bepul bo'lim" : 'Cheksiz paket' });
    } catch (e) {
      toast({ tone: 'err', title: 'Saqlanmadi', text: errText(e) });
    } finally {
      setBusy(null);
    }
  }
  const rows = [
    { k: 'freeSectionEnabled' as const, t: "Bepul bo'lim", s: "Har imtihonda bitta bo'lim bir marta bepul (IELTS Listening/Reading, SAT R&W)", v: s.examSettings.freeSectionEnabled },
    { k: 'unlimitedEnabled' as const, t: 'Cheksiz paket', s: '"Cheksiz 30 kun" mahsuloti narxlar sahifasida va saytda ko\'rinadi', v: s.examSettings.unlimitedEnabled },
  ];
  return (
    <section style={{ ...card, gap: 6 }}>
      <h3 style={{ ...h3, margin: '0 0 8px' }}>Imtihon sozlamalari</h3>
      {rows.map((r) => (
        <div key={r.k} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}><b style={{ fontSize: 14 }}>{r.t}</b><span style={{ fontSize: 12, color: 'var(--mut)', fontWeight: 600 }}>{r.s}</span></div>
          <Toggle label={r.t} checked={r.v} disabled={busy === r.k} onChange={(v) => set(r.k, v)} />
        </div>
      ))}
    </section>
  );
}
