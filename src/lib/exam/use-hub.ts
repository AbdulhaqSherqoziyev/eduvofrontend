'use client';
/** TanStack Query hooks for the student hub. Components never call hubApi directly. */
import { useMutation, useQueries, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { HubError, hubApi, hubNow } from './hub-api';
import type { CreateAttemptBody } from './hub-types';
import { readCodeSession, type CodeSession } from './session';

/** Only a dead connection or a 5xx is worth a silent retry; 4xx answers are states. */
const retry = (n: number, e: unknown) => n < 2 && e instanceof HubError && (e.kind === 'network' || e.kind === 'server');

export const hubKeys = {
  hub: ['exams-hub'] as const,
  detail: (code: string) => ['exams-hub', 'detail', code] as const,
  progress: ['exams-hub', 'progress'] as const,
  attempt: (id: string) => ['exams-hub', 'attempt', id] as const,
  result: (id: string) => ['exams-hub', 'result', id] as const,
};

export function useHub(enabled = true) {
  return useQuery({ queryKey: hubKeys.hub, queryFn: hubApi.hub, retry, enabled });
}

export function useExamDetail(code: string, enabled = true) {
  return useQuery({ queryKey: hubKeys.detail(code), queryFn: () => hubApi.detail(code), retry, enabled });
}

export function useProgress(enabled = true) {
  return useQuery({ queryKey: hubKeys.progress, queryFn: hubApi.progress, retry, enabled });
}

/** Resume state of one attempt — used for "Tugallanmagan · Reading" and "41:12 qoldi". */
export function useAttemptState(id: string | null) {
  return useQuery({ queryKey: hubKeys.attempt(id ?? ''), queryFn: () => hubApi.attempt(id!), retry, enabled: !!id });
}

/** Result polls every 10 s while some section is still being graded (§4). */
export function useResult(id: string) {
  return useQuery({
    queryKey: hubKeys.result(id),
    queryFn: () => hubApi.result(id),
    retry,
    refetchInterval: (q) => (q.state.data?.status === 'PARTIAL' ? 10_000 : false),
  });
}

/** Results of the last few attempts — question types for "Qayta ko'rish kerak bo'lgan savol turlari". */
export function useResults(ids: string[]) {
  return useQueries({
    queries: ids.map((id) => ({ queryKey: hubKeys.result(id), queryFn: () => hubApi.result(id), retry, staleTime: 5 * 60_000 })),
  });
}

export function useCreateAttempt() {
  return useMutation({ mutationFn: (b: CreateAttemptBody) => hubApi.createAttempt(b) });
}

export function useCodeLogin() {
  return useMutation({ mutationFn: (v: { code: string; fullName: string }) => hubApi.codeLogin(v.code, v.fullName) });
}

/** Server-aligned "now", re-rendered every `ms` (assignment windows open without a reload). */
export function useHubNow(ms = 30_000): number {
  const [now, setNow] = useState(() => hubNow());
  useEffect(() => {
    const iv = window.setInterval(() => setNow(hubNow()), ms);
    return () => window.clearInterval(iv);
  }, [ms]);
  return now;
}

/** Skeletons appear only after 300 ms, so a fast answer never flashes grey boxes (§2). */
export function useDelayed(active: boolean, ms = 300): boolean {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!active) {
      setShow(false);
      return;
    }
    const tm = window.setTimeout(() => setShow(true), ms);
    return () => window.clearTimeout(tm);
  }, [active, ms]);
  return show;
}

/** The player needs a wide window (MinWidthGate 1280). `null` until measured. */
export function useCanRunPlayer(min = 1280): boolean | null {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    const on = () => setOk(window.innerWidth >= min);
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [min]);
  return ok;
}

/** Name + session kind for the shell header. */
export function useHubIdentity() {
  const [code, setCode] = useState<CodeSession | null | undefined>(undefined);
  useEffect(() => setCode(readCodeSession()), []);
  const me = useQuery({ queryKey: ['exams-hub', 'me'], queryFn: hubApi.me, retry, staleTime: 10 * 60_000, enabled: code === null });
  return { codeSession: code ?? null, ready: code !== undefined, fullName: code?.student.fullName ?? me.data?.student.fullName ?? null };
}
