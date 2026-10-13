import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ownerExamsApi, type QuestionPatch, type TableDetail } from '@/lib/api/owner-exams';

const K = 'owner-exams';

export const useExamConfigs = () => useQuery({ queryKey: [K, 'configs'], queryFn: ownerExamsApi.configs, staleTime: 300_000 });
export const useBankTests = (examCode: string) => useQuery({ queryKey: [K, 'tests', examCode], queryFn: () => ownerExamsApi.tests(examCode || undefined) });
export const useBankTest = (id: string | null) => useQuery({ queryKey: [K, 'test', id], queryFn: () => ownerExamsApi.test(id!), enabled: !!id });
export const useConvTables = (examCode: string) => useQuery({ queryKey: [K, 'tables', examCode], queryFn: () => ownerExamsApi.tables(examCode || undefined) });
export const useConvTable = (code: string | null) => useQuery({ queryKey: [K, 'table', code], queryFn: () => ownerExamsApi.table(code!), enabled: !!code });

/** Every write refreshes the whole test-bank cache — lists are short (≤200). */
function useBankMutation<V>(fn: (v: V) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => void qc.invalidateQueries({ queryKey: [K] }) });
}

export const usePublishTest = () => useBankMutation((id: string) => ownerExamsApi.publish(id));
export const useUnpublishTest = () => useBankMutation((id: string) => ownerExamsApi.unpublish(id));
export const useRemoveTest = () => useBankMutation((id: string) => ownerExamsApi.remove(id));
export const usePatchQuestions = (testId: string) => useBankMutation((qs: QuestionPatch[]) => ownerExamsApi.patch(testId, qs));
export const usePutTable = (code: string) => useBankMutation((b: { rows: TableDetail['rows']; isEstimated: boolean }) => ownerExamsApi.putTable(code, b));

/** Backend error text (Uzbek, written for staff) or a fallback. */
export function errText(e: unknown, fallback = "Amal bajarilmadi. Qayta urinib ko'ring."): string {
  const d = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data;
  const m = Array.isArray(d?.message) ? d?.message.join(', ') : d?.message;
  return m || fallback;
}
