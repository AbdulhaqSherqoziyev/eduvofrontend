'use client';
/** /login on the admin host: contract §1 A1 (password) → A2/A3 (2FA enroll / verify). */
import { useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-mock/api';
import { AdminApiError } from '@/lib/admin-mock/http';
import { getAdminToken, setAdminToken } from '@/lib/admin-mock/session';
import { errText } from '@/lib/admin-mock/errors';
import { ME_KEY } from '../shell/context';
import { homeFor } from '../shell/nav';
import { AdminLoginScreen } from './login-screen';
import type { AdminLoginHandlers, CodeResult, PasswordResult } from './types';

const RESTART = "Kirish muddati o'tdi. Parolni qaytadan kiriting.";

/** Only same-site paths are followed after login (no open redirect). */
const safeNext = (v: string | null) => (v && v.startsWith('/') && !v.startsWith('//') && !v.startsWith('/\\') && !v.startsWith('/login') ? v : null);

export function AdminLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const qc = useQueryClient();
  const challenge = useRef<string | null>(null);
  const perms = useRef<string[]>([]);
  const next = safeNext(params.get('next'));

  useEffect(() => {
    if (getAdminToken()) router.replace(next ?? '/');
  }, [router, next]);

  const handlers = useMemo<AdminLoginHandlers>(() => ({
    async submitPassword(email, password): Promise<PasswordResult> {
      try {
        const r = await adminApi.login(email, password);
        challenge.current = r.challengeToken;
        return { kind: r.step === 'enroll' ? 'enroll' : 'code' };
      } catch (e) {
        if (!(e instanceof AdminApiError) || e.code === 'NETWORK') throw e;
        if (e.code === 'INVALID_CREDENTIALS') return { kind: 'wrong', triesLeft: Number(e.data.triesLeft ?? 0) };
        if (e.code === 'LOGIN_LOCKED') return { kind: 'locked' };
        if (e.code === 'ADMIN_DISABLED') return { kind: 'error', text: "Hisobingiz o'chirilgan. Owner'ga murojaat qiling." };
        return { kind: 'error', text: errText(e) };
      }
    },
    async startEnroll() {
      const r = await adminApi.enroll(challenge.current ?? '');
      return { secret: r.secret, qrSvg: r.qrSvg };
    },
    async submitCode(code): Promise<CodeResult> {
      try {
        const r = await adminApi.verify(challenge.current ?? '', code);
        setAdminToken(r.accessToken, r.expiresAt);
        qc.setQueryData(ME_KEY, r.me);
        perms.current = r.me.permissions;
        return { kind: 'ok' };
      } catch (e) {
        if (!(e instanceof AdminApiError) || e.code === 'NETWORK') throw e;
        if (e.code === 'CODE_EXPIRED') return { kind: 'expired' };
        if (e.code === 'CODE_INVALID') return { kind: 'invalid' };
        if (e.code === 'LOGIN_LOCKED') return { kind: 'locked' };
        if (e.code === 'CHALLENGE_INVALID' || e.code === 'TOTP_ALREADY_ENROLLED') return { kind: 'restart', text: RESTART };
        return { kind: 'error', text: errText(e) };
      }
    },
    done() {
      router.replace(next ?? homeFor(perms.current));
    },
  }), [qc, router, next]);

  return <AdminLoginScreen handlers={handlers} />;
}
