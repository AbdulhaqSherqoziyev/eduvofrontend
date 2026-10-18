'use client';
/**
 * /invite?token=… — accept an admin invite and set a password (contract A6/A7). Not in the design:
 * Sarvar asked for the login-card style, minimal. After it: /login → 2FA enrollment.
 */
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-mock/api';
import { AdminApiError } from '@/lib/admin-mock/http';
import { errText } from '@/lib/admin-mock/errors';
import { Button } from '../ui/button';
import { LoginFrame } from './login-screen';

const ROLE: Record<string, string> = { owner: 'Owner', operator: 'Operator', content: 'Kontent' };

export function InvitePage() {
  const token = useSearchParams().get('token') ?? '';
  const info = useQuery({ queryKey: ['am', 'invite', token], queryFn: () => adminApi.invite(token), enabled: !!token, retry: false });
  const [name, setName] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState<{ field?: 'pw' | 'pw2'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => { if (info.data?.fullName) setName(info.data.fullName); }, [info.data]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (pw.length < 12) return setErr({ field: 'pw', text: "Parol kamida 12 belgidan iborat bo'lsin." });
    if (pw !== pw2) return setErr({ field: 'pw2', text: 'Parollar bir xil emas.' });
    setBusy(true);
    setErr(null);
    try {
      const r = await adminApi.acceptInvite({ token, password: pw, fullName: name.trim() || undefined });
      setDone(r.email);
    } catch (e2) {
      const fields = e2 instanceof AdminApiError ? (e2.data.fields as Array<{ field: string; code: string }> | undefined) : undefined;
      const f = fields?.find((x) => x.field === 'password');
      if (f?.code === 'PASSWORD_TOO_SHORT') setErr({ field: 'pw', text: "Parol kamida 12 belgidan iborat bo'lsin." });
      else if (f?.code === 'PASSWORD_TOO_WEAK') setErr({ field: 'pw', text: 'Parol juda oddiy. Boshqasini tanlang.' });
      else setErr({ text: errText(e2) });
    } finally {
      setBusy(false);
    }
  }

  const gone = !token || (info.error instanceof AdminApiError && info.error.status === 410);

  return (
    <LoginFrame>
      {done ? (
        <div className="ma-login-step">
          <div className="ma-login-head">
            <h1>Parol o&apos;rnatildi</h1>
            <span>{done} bilan kiring. Birinchi kirishda 2 bosqichli tasdiqni ulaysiz.</span>
          </div>
          <Link href="/login" className="ma-btn v-primary s-50 w-full">Kirish</Link>
        </div>
      ) : gone ? (
        <div className="ma-login-step">
          <div className="ma-login-head">
            <h1>Taklif yaroqsiz</h1>
            <span>{info.error ? errText(info.error) : 'Taklif havolasi yaroqsiz yoki ishlatilgan.'}</span>
          </div>
          <Link href="/login" className="ma-btn v-secondary s-50 w-full">Kirish sahifasiga</Link>
        </div>
      ) : info.isError ? (
        <div className="ma-login-step" role="alert">
          <div className="ma-login-head">
            <h1>Ma&apos;lumotlarni yuklab bo&apos;lmadi</h1>
            <span>{errText(info.error)}</span>
          </div>
          <Button size={50} onClick={() => info.refetch()}>Qayta urinish</Button>
        </div>
      ) : !info.data ? (
        <div className="ma-login-step" aria-busy="true">
          <span className="ma-skel" style={{ height: 28, width: '60%' }} />
          <span className="ma-skel" style={{ height: 48 }} />
          <span className="ma-skel" style={{ height: 48 }} />
          <span className="ma-skel" style={{ height: 50 }} />
        </div>
      ) : (
        <form className="ma-login-step" onSubmit={submit} noValidate>
          <div className="ma-login-head">
            <h1>Taklifni qabul qilish</h1>
            <span>{info.data.email} · {ROLE[info.data.role] ?? info.data.role}. Parol o&apos;rnating — kamida 12 belgi.</span>
          </div>
          <label className="ma-field">
            <span className="ma-label">Ism</span>
            <input className="ma-input s-48" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" />
          </label>
          <label className="ma-field">
            <span className="ma-label">Parol</span>
            <input className={`ma-input s-48${err?.field === 'pw' ? ' is-error' : ''}`} type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} maxLength={200} autoFocus />
            {err?.field === 'pw' && <span className="ma-field-error" role="alert">{err.text}</span>}
          </label>
          <label className="ma-field">
            <span className="ma-label">Parolni takrorlang</span>
            <input className={`ma-input s-48${err?.field === 'pw2' ? ' is-error' : ''}`} type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} maxLength={200} />
            {err?.field === 'pw2' && <span className="ma-field-error" role="alert">{err.text}</span>}
          </label>
          {err && !err.field && <span className="ma-field-error" role="alert">{err.text}</span>}
          <Button type="submit" size={50} loading={busy}>Parolni o&apos;rnatish</Button>
        </form>
      )}
    </LoginFrame>
  );
}
