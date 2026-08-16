import { api } from './client';
import type { CompensationInput, CompensationView, SubjectType } from '../types/payroll';

const one = (subjectType: SubjectType, subjectId: string) => `/compensation/${subjectType}/${subjectId}`;

/**
 * "Ish haqi" bloki (§A). `compensation.update` bilan qo'riqlanadi — `teacher.update`
 * bilan emas: telefon raqamini tuzatadigan resepsion maoshni ko'rmasin [S5.2].
 */
export const compensationApi = {
  get: (subjectType: SubjectType, subjectId: string) =>
    api.get<CompensationView>(one(subjectType, subjectId)).then((r) => r.data),

  /** YANGI VERSIYA yozadi — eskisi tegilmaydi, o'tgan oylar hisobi o'zgarmaydi. */
  put: (subjectType: SubjectType, subjectId: string, payload: CompensationInput) =>
    api.put<CompensationView>(one(subjectType, subjectId), payload).then((r) => r.data),

  /** Keyingi oydan qoida yo'q; o'tgan oylarniki saqlanadi. */
  remove: (subjectType: SubjectType, subjectId: string) =>
    api.delete<CompensationView>(one(subjectType, subjectId)).then((r) => r.data),
};
