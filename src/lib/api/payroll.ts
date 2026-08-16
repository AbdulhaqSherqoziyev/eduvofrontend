import { api } from './client';
import { cleanParams } from './http';
import type {
  AdjustLineInput,
  MyPayrollLines,
  MyPayrollView,
  PayPayrollInput,
  PayResult,
  PeriodView,
  PreviewInput,
  PreviewResponse,
} from '../types/payroll';

const period = (p: string) => `/payroll/periods/${p}`;

export const payrollApi = {
  /**
   * Jonli misol (§B) — bu arifmetikaning YAGONA manbai [§H.3/3].
   *
   * Frontendda `max()` yoki `× percent` hech qayerda takrorlanmaydi: formulaning
   * ikkinchi nusxasi albatta ajraladi, ajralganini birinchi ustoz sezadi.
   */
  preview: (payload: PreviewInput) =>
    api.post<PreviewResponse>('/payroll/preview', payload).then((r) => r.data),

  /**
   * Chaqiruvchining O'Z kartasi. `teacherId` parametri ataylab yo'q — boshqa
   * odamnikini so'raydigan so'rov mavjud emas, ya'ni rad etiladigan narsa ham
   * yo'q [§C.1/2]. Bu 403 dan kuchliroq kafolat.
   */
  me: (p?: string) =>
    api.get<MyPayrollView>('/payroll/me', { params: cleanParams({ period: p }) }).then((r) => r.data),

  /** Tushgan to'lovlar. Javobda qarz/qisman belgisi yo'q [SV2]. */
  myLines: (params: { period?: string; groupId?: string; page?: number }) =>
    api.get<MyPayrollLines>('/payroll/me/lines', { params: cleanParams(params) }).then((r) => r.data),

  periodView: (p: string) => api.get<PeriodView>(period(p)).then((r) => r.data),

  compute: (p: string) => api.post<PeriodView>(`${period(p)}/compute`).then((r) => r.data),
  approve: (p: string) => api.post<PeriodView>(`${period(p)}/approve`).then((r) => r.data),
  /** To'langan qator bo'lsa 409 qaytadi — bu holat UI'da alohida yoziladi. */
  reopen: (p: string) => api.post<PeriodView>(`${period(p)}/reopen`).then((r) => r.data),

  /** `amount < 0` bo'lsa `note` majburiy — backend ham 400 bilan talab qiladi. */
  adjust: (lineId: string, payload: AdjustLineInput) =>
    api.post<PeriodView>(`/payroll/lines/${lineId}/adjust`, payload).then((r) => r.data),

  /** Idempotent: `clientRef` tufayli qayta yuborish kassadan ikkinchi marta chiqarmaydi. */
  pay: (payload: PayPayrollInput) => api.post<PayResult>('/payroll/pay', payload).then((r) => r.data),
};
