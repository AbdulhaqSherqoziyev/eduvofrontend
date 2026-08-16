import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { compensationApi } from '../api/compensation';
import { payrollApi } from '../api/payroll';
import type { CompensationInput, PreviewInput, SubjectType } from '../types/payroll';

export const COMPENSATION_KEY = 'compensation';
export const PREVIEW_KEY = 'payroll-preview';

/**
 * Bitta xodimning ish haqi qoidasi (§A).
 *
 * `enabled` shart: blok yig'ilgan turganda ham dialog ochilishi bilan so'rov
 * ketadi, lekin ruxsati yo'q foydalanuvchida blok umuman render qilinmaydi va
 * so'rov ham tug'ilmaydi — 403 ni ushlab keyin yashirish emas.
 */
export function useCompensation(subjectType: SubjectType, subjectId: string | null, enabled = true) {
  return useQuery({
    queryKey: [COMPENSATION_KEY, subjectType, subjectId],
    queryFn: () => compensationApi.get(subjectType, subjectId!),
    enabled: enabled && !!subjectId,
  });
}

/** Barcha maosh ekranlari qoidaga bog'liq — bittasi o'zgarsa hammasi qayta so'raladi. */
function invalidatePayroll(qc: ReturnType<typeof useQueryClient>): void {
  [COMPENSATION_KEY, 'payroll', 'my-payroll'].forEach((key) => qc.invalidateQueries({ queryKey: [key] }));
}

/**
 * `subjectId` chaqirilganda beriladi, hook yaratilganda emas: yangi o'qituvchi
 * formasida id faqat xodim yaratilgandan KEYIN paydo bo'ladi va qoida o'sha
 * zahoti, bitta oqimda saqlanadi.
 */
export function useSaveCompensation(subjectType: SubjectType) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { subjectId: string; input: CompensationInput }) =>
      compensationApi.put(subjectType, v.subjectId, v.input),
    onSuccess: () => invalidatePayroll(qc),
  });
}

export function useRemoveCompensation(subjectType: SubjectType) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (subjectId: string) => compensationApi.remove(subjectType, subjectId),
    onSuccess: () => invalidatePayroll(qc),
  });
}

/**
 * Jonli misol (§B) — raqamlar SERVERDA hisoblanadi [§H.3/3].
 *
 * `placeholderData` ataylab: maydonga har harf kiritilganda raqamlar yo'qolib
 * qayta paydo bo'lsa, blok "buzuq" ko'rinadi va direktor unga qaramay qo'yadi.
 * Eski raqam joyida qoladi, ustiga faqat `opacity` tushadi (§B.5).
 */
export function usePayrollPreview(input: PreviewInput | null) {
  return useQuery({
    queryKey: [PREVIEW_KEY, input],
    queryFn: () => payrollApi.preview(input!),
    enabled: !!input,
    placeholderData: (prev) => prev,
    retry: false,
  });
}
