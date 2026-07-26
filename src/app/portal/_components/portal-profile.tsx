'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { NmButton } from '@/components/ui/nm-button';
import { NmInput } from '@/components/ui/nm-input';
import { NmPasswordInput } from '@/components/ui/nm-password-input';
import { FieldLabel } from '@/components/ui/label';
import { apiFetch } from '../_lib/api';
import type { Overview } from '../_lib/types';
import { PaymentDetail, PaymentLine } from './portal-payment';

const CARD = 'p-4 sm:p-5';

type PwState = '' | 'ok' | 'wrong' | 'short' | 'network' | 'server';

const PW_TEXT = (min: number): Record<Exclude<PwState, '' | 'ok'>, string> => ({
  wrong: 'Joriy parol xato.',
  short: `Yangi parol kamida ${min} ta belgidan iborat bo'lsin.`,
  network: "Internet bilan aloqa yo'q. Ulanishni tekshiring.",
  server: "Saqlanmadi. Qayta urinib ko'ring.",
});

/** Shared by the family portal (PATCH /portal/password, 4 chars) and the
 *  teacher app (POST /auth/change-password, 6 chars). */
export function PasswordForm({
  token,
  path = '/portal/password',
  method = 'PATCH',
  min = 4,
  onToken,
}: {
  token: string;
  path?: string;
  method?: string;
  min?: number;
  /** Changing the password invalidates the old token immediately (its
   *  fingerprint is baked in). Without adopting the fresh one the person is
   *  thrown out the instant they succeed — the worst possible moment. */
  onToken?: (t: string) => void;
}) {
  const [cur, setCur] = useState('');
  const [nw, setNw] = useState('');
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<PwState>('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('');
    if (nw.length < min) {
      setState('short');
      return;
    }
    setBusy(true);
    const res = await apiFetch<{ ok: true; accessToken?: string }>(path, {
      token,
      method,
      body: { currentPassword: cur, newPassword: nw },
    });
    setBusy(false);
    if (res.ok) {
      setCur('');
      setNw('');
      setState('ok');
      if (res.data?.accessToken) onToken?.(res.data.accessToken);
      return;
    }
    // A 401 here is NOT an expired session — the backend answers a wrong
    // current password with 401. Signing the family out for a typo would be
    // exactly the failure this whole wave exists to remove.
    setState(res.kind === 'auth' ? 'wrong' : res.kind);
  };

  return (
    <NmCard className={CARD}>
      <div className="mb-3 text-[13.5px] font-extrabold text-foreground">Parolni o&apos;zgartirish</div>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div>
          <FieldLabel htmlFor="pw-cur">JORIY PAROL</FieldLabel>
          <NmPasswordInput id="pw-cur" value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" />
        </div>
        <div>
          <FieldLabel htmlFor="pw-new">YANGI PAROL</FieldLabel>
          <NmPasswordInput
            id="pw-new"
            value={nw}
            onChange={(e) => setNw(e.target.value)}
            placeholder={`Kamida ${min} belgi`}
            autoComplete="new-password"
          />
        </div>
        <NmButton type="submit" className="min-h-[44px]" disabled={busy || !cur || !nw}>
          {busy ? 'Saqlanmoqda...' : 'Saqlash'}
        </NmButton>
        {state === 'ok' ? (
          <span className="text-[12.5px] font-bold text-success">Saqlandi ✓</span>
        ) : state ? (
          <span className={`text-[12.5px] font-bold ${state === 'wrong' ? 'text-danger' : 'text-muted'}`}>
            {PW_TEXT(min)[state]}
          </span>
        ) : null}
      </form>
    </NmCard>
  );
}

/**
 * Profil — where the account lives, including the only sign-out button in the
 * app. It is deliberately the last thing on the last tab: the login came from
 * the centre, the child does not know it, and a stray tap used to delete it.
 */
export function ProfileTab({
  d,
  token,
  onLogout,
  onToken,
}: {
  d: Overview;
  token: string;
  onLogout: () => void;
  onToken?: (t: string) => void;
}) {
  const [money, setMoney] = useState(false);
  const student = d.role === 'student';

  if (money) {
    return (
      <>
        <button
          type="button"
          onClick={() => setMoney(false)}
          className="inline-flex min-h-[44px] items-center gap-1 self-start rounded-ctl bg-background px-3 text-[13px] font-bold text-primary shadow-nm-sm"
        >
          <ChevronLeft className="size-4" />
          Profil
        </button>
        <PaymentDetail d={d} title="To'lov" />
      </>
    );
  }

  return (
    <>
      <NmCard className={CARD}>
        <div className="text-[17px] font-extrabold text-foreground">{d.student.fullName}</div>
        <div className="mt-0.5 text-[12.5px] font-semibold text-muted">
          {student ? "O'quvchi" : 'Ota-ona'}
          {d.student.phone ? ` · ${d.student.phone}` : ''}
        </div>
      </NmCard>

      <NmCard className={CARD}>
        <div className="mb-2 text-[13.5px] font-extrabold text-foreground">Guruhlar</div>
        {d.groups?.length ? (
          <div className="flex flex-col gap-1.5">
            {d.groups.map((g) => (
              <div key={g.id} className="rounded-[12px] bg-background px-3 py-2 shadow-nm-inset-sm">
                <div className="truncate text-[13px] font-bold text-foreground">{g.name}</div>
                <div className="truncate text-[12.5px] font-semibold text-muted">
                  {[g.teacherName, g.schedule, g.time, g.room].filter(Boolean).join(' · ')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] font-semibold text-muted">Guruh biriktirilmagan.</p>
        )}
      </NmCard>

      {/* Money is a row inside Profil, not a fifth tab and never on the home
          screen: adult courses need it, a child does not need it daily. */}
      {student ? (
        <button
          type="button"
          onClick={() => setMoney(true)}
          className="w-full rounded-card bg-surface p-4 text-left shadow-nm sm:p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[13.5px] font-extrabold text-foreground">To&apos;lov</div>
              <div className="mt-1">
                <PaymentLine d={d} />
              </div>
            </div>
            <ChevronRight className="size-5 shrink-0 text-muted" />
          </div>
        </button>
      ) : null}

      <PasswordForm token={token} onToken={onToken} />

      <NmButton variant="danger" className="min-h-[44px] w-full" onClick={onLogout}>
        Chiqish
      </NmButton>
    </>
  );
}
