import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SpeakingOverrideBody } from '@/lib/exam/speaking-types';
import {
  centerExamsApi, type AssignmentStatusFilter, type CreateAssignmentInput, type PatchAssignmentInput, type ResultsQuery,
} from '../api/center-exams';

/** TanStack hooks for the centre mock-exam console (`/api/exams/*`). */
export const KEY = 'center-exams';
const LIVE_POLL_MS = 5_000;

export function useExamCatalog() {
  return useQuery({ queryKey: [KEY, 'catalog'], queryFn: centerExamsApi.catalog });
}

export function usePublishedTests(examCode?: string, enabled = true) {
  return useQuery({
    queryKey: [KEY, 'tests', examCode ?? 'all'],
    queryFn: () => centerExamsApi.tests(examCode),
    enabled,
  });
}

export function useExamAssignments(status: AssignmentStatusFilter | undefined, page = 1, limit = 20) {
  return useQuery({
    queryKey: [KEY, 'assignments', status ?? 'all', page, limit],
    queryFn: () => centerExamsApi.assignments({ status, page, limit }),
    placeholderData: keepPreviousData,
  });
}

export function useExamAssignment(id: string) {
  return useQuery({ queryKey: [KEY, 'assignment', id], queryFn: () => centerExamsApi.assignment(id), enabled: !!id });
}

/** Live monitor — polls every 5 s while `live` (window open); one fetch otherwise. */
export function useAssignmentLive(id: string | undefined, live: boolean) {
  return useQuery({
    queryKey: [KEY, 'live', id],
    queryFn: () => centerExamsApi.live(id!),
    enabled: !!id,
    refetchInterval: live ? LIVE_POLL_MS : false,
  });
}

export function useExamResults(q: ResultsQuery, enabled = true) {
  return useQuery({ queryKey: [KEY, 'results', q], queryFn: () => centerExamsApi.results(q), placeholderData: keepPreviousData, enabled });
}

/** Staff full result of one attempt; re-read every 15 s while Writing/Speaking are graded. */
export function useExamAttemptResult(id: string) {
  return useQuery({
    queryKey: [KEY, 'attempt-result', id],
    queryFn: () => centerExamsApi.attemptResult(id),
    enabled: !!id,
    refetchInterval: (q) => (q.state.data?.status === 'PARTIAL' ? 15_000 : false),
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: [KEY] });
}

export function useCreateAssignment() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (input: CreateAssignmentInput) => centerExamsApi.create(input), onSuccess: invalidate });
}

export function usePatchAssignment(id: string) {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (input: PatchAssignmentInput) => centerExamsApi.patch(id, input), onSuccess: invalidate });
}

export function useDeleteAssignment() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => centerExamsApi.remove(id), onSuccess: invalidate });
}

export function useAccessCodes(assignmentId: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (studentIds?: string[]) => centerExamsApi.accessCodes(assignmentId, studentIds),
    onSuccess: invalidate,
  });
}

/**
 * "O'quvchi ko'rinishida ochish": the tab is opened synchronously (popup
 * blockers), then pointed at the free preview attempt with its own token.
 */
export function useExamPreview() {
  const m = useMutation({ mutationFn: (v: { testId: string; sectionKey?: string }) => centerExamsApi.preview(v.testId, v.sectionKey) });
  const open = (testId: string, sectionKey?: string) => {
    const tab = window.open('about:blank', '_blank');
    m.mutate({ testId, sectionKey }, {
      onSuccess: (r) => {
        if (tab) tab.location.href = `/exam/${encodeURIComponent(r.attemptId)}?preview=${encodeURIComponent(r.token)}`;
      },
      onError: () => tab?.close(),
    });
  };
  return { open, isPending: m.isPending, error: m.error, reset: m.reset };
}

/** Speaking override / revert (contract §7, §7a): not optimistic — the result is re-read on success. */
export function useSpeakingOverride(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: SpeakingOverrideBody) => centerExamsApi.overrideSpeaking(id, b),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'attempt-result', id] }),
  });
}

export function useSpeakingRevert(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => centerExamsApi.revertSpeaking(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, 'attempt-result', id] }),
  });
}
