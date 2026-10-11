import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { examsV3Api, type JobStatus } from '../api/center-exams-v3';
import { can } from '../auth/permissions';
import { moduleOn } from '../auth/module-gate';
import { KEY } from './use-center-exams';

/** TanStack hooks for the v3 console additions (§2b). Same key root → one invalidation. */
const on = () => moduleOn('mock_exams') && can('exam.read');

/** Credit balance, prices and packages (header pill, catalogue KPI, Kreditlar). */
export function useExamCredits(enabled = true) {
  return useQuery({
    queryKey: [KEY, 'credits'],
    queryFn: () => examsV3Api.credits(1, 20),
    enabled: enabled && on(),
    staleTime: 30_000,
  });
}

export function usePurchaseCredits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (packageKey: string) => examsV3Api.purchase(packageKey),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

const GRADING_POLL_MS = 10_000;

export function useGradingStats(enabled = true) {
  return useQuery({
    queryKey: [KEY, 'grading', 'stats'],
    queryFn: examsV3Api.gradingStats,
    enabled: enabled && on(),
    refetchInterval: GRADING_POLL_MS,
    retry: false,
  });
}

/** Job list polls while something is still being graded. */
export function useGradingJobs(status?: JobStatus) {
  return useQuery({
    queryKey: [KEY, 'grading', 'jobs', status ?? 'all'],
    queryFn: () => examsV3Api.gradingJobs(status),
    placeholderData: keepPreviousData,
    refetchInterval: (q) => (q.state.data?.some((j) => j.status === 'run' || j.status === 'retry') ? GRADING_POLL_MS : false),
  });
}

export function useGradingJob(id: string | undefined, running: boolean) {
  return useQuery({
    queryKey: [KEY, 'grading', 'job', id],
    queryFn: () => examsV3Api.gradingJob(id!),
    enabled: !!id,
    refetchInterval: running ? GRADING_POLL_MS : false,
  });
}

export function useBankTests() {
  return useQuery({ queryKey: [KEY, 'bank', 'tests'], queryFn: examsV3Api.bankTests });
}

export function useBankImport() {
  return useMutation({ mutationFn: (v: { files: File[]; dryRun: boolean }) => examsV3Api.bankImport(v.files, v.dryRun) });
}

export function useBankPublish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => examsV3Api.bankPublish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useConversionTable(examCode: string, section: string) {
  return useQuery({
    queryKey: [KEY, 'bank', 'conversion', examCode, section],
    queryFn: () => examsV3Api.conversionTable(examCode, section),
    staleTime: 5 * 60_000,
  });
}

export function useAcceptedVariants(testId: string | undefined) {
  return useQuery({
    queryKey: [KEY, 'bank', 'accepted', testId],
    queryFn: () => examsV3Api.accepted(testId!),
    // Answer keys are visible here — exam.manage only (§2b); teachers never request it.
    enabled: !!testId && can('exam.manage'),
  });
}
