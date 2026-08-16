import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { payrollApi } from '../api/payroll';
import type { AdjustLineInput, PayPayrollInput } from '../types/payroll';

export const PAYROLL_KEY = 'payroll';
export const MY_PAYROLL_KEY = 'my-payroll';

/**
 * Maosh yozuvi kassa qoldig'ini ham qimirlatadi, shuning uchun kassa kalitlari
 * ham bekor qilinadi. Optimistik yangilanish YO'Q (spec §0.3): bu ekranda
 * raqamga qarab pul beriladi va bir soniya noto'g'ri turgan summa
 * kutishdan qimmatroq.
 */
function invalidateAll(qc: QueryClient): void {
  [PAYROLL_KEY, MY_PAYROLL_KEY, 'transactions', 'cash', 'dashboard'].forEach((key) =>
    qc.invalidateQueries({ queryKey: [key] }),
  );
}

/** Ustozning o'z kartasi. Parametr faqat davr — `teacherId` mavjud emas [§C.1]. */
export function useMyPayroll(period: string) {
  return useQuery({
    queryKey: [MY_PAYROLL_KEY, period],
    queryFn: () => payrollApi.me(period),
    retry: false,
  });
}

/** Raqam bosilganda ochiladigan to'lovlar ro'yxati (§C.7). */
export function useMyPayrollLines(
  params: { period: string; groupId?: string; page?: number },
  enabled: boolean,
) {
  return useQuery({
    queryKey: [MY_PAYROLL_KEY, 'lines', params],
    queryFn: () => payrollApi.myLines(params),
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function usePayrollPeriod(period: string) {
  return useQuery({
    queryKey: [PAYROLL_KEY, period],
    queryFn: () => payrollApi.periodView(period),
    retry: false,
  });
}

export function useComputePeriod(period: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => payrollApi.compute(period),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useApprovePeriod(period: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => payrollApi.approve(period),
    onSuccess: () => invalidateAll(qc),
  });
}

/** To'langan qator bo'lsa backend 409 qaytaradi — xabar dialogda ko'rsatiladi. */
export function useReopenPeriod(period: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => payrollApi.reopen(period),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useAdjustLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { lineId: string; input: AdjustLineInput }) => payrollApi.adjust(v.lineId, v.input),
    onSuccess: () => invalidateAll(qc),
  });
}

export function usePayPayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PayPayrollInput) => payrollApi.pay(input),
    onSuccess: () => invalidateAll(qc),
  });
}
