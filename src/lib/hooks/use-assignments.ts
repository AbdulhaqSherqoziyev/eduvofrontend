import { useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assignmentsApi, type AssignmentSubmissionRow } from '../api/assignments';
import type { AssignmentListParams } from '../types/assignment';
import type { HomeworkMarkInput, SaveMarksInput } from '../types/homework';

const KEY = 'assignments';

export function useAssignments(params: AssignmentListParams = {}) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => assignmentsApi.list(params) });
}

export function useAssignment(id: string) {
  return useQuery({ queryKey: [KEY, id], queryFn: () => assignmentsApi.get(id), enabled: !!id });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: [KEY] });
}

export function useCreateAssignment() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: assignmentsApi.create, onSuccess: invalidate });
}

export function useDeleteAssignment() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: assignmentsApi.softDelete, onSuccess: invalidate });
}

export function useSubmissions(id: string, enabled: boolean) {
  return useQuery({ queryKey: [KEY, id, 'submissions'], queryFn: () => assignmentsApi.submissions(id), enabled });
}

/** Legacy single-submission grading — kept for callers that still hold a submissionId. */
export function useGradeSubmission(assignmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, score }: { submissionId: string; score: number }) =>
      assignmentsApi.grade(submissionId, { score }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, assignmentId, 'submissions'] });
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

/** What the row looks like the instant the teacher taps, before the server answers. */
function applyOptimistic(row: AssignmentSubmissionRow, m: HomeworkMarkInput): AssignmentSubmissionRow {
  if (m.state === 'CLEAR') {
    // A portal submission survives un-marking (§D.3): only the verdict goes.
    return { ...row, state: row.source === 'PORTAL' ? 'SUBMITTED' : 'UNMARKED', score: null, scoreMax: null };
  }
  if (m.state === 'NOT_DONE') return { ...row, state: 'NOT_DONE', score: null, scoreMax: null };
  return { ...row, state: 'DONE', score: m.score ?? null };
}

/**
 * §D.3 — autosave one or more homework marks for an assignment.
 *
 * Optimistic per student: only the rows named in the request are touched, on
 * success they are replaced by the server's echo (clipped score, editedAt), on
 * error they go back to what they were. Rows belonging to other in-flight taps
 * are never overwritten, and a stale answer never beats a newer tap for the
 * same student (sequence check).
 */
export function useSaveMarks(assignmentId: string) {
  const qc = useQueryClient();
  const key = [KEY, assignmentId, 'submissions'];
  const seqRef = useRef(0);
  const latestRef = useRef<Map<string, number>>(new Map());

  const patch = (fn: (row: AssignmentSubmissionRow) => AssignmentSubmissionRow) =>
    qc.setQueryData<AssignmentSubmissionRow[]>(key, (rows) => (rows ? rows.map(fn) : rows));

  return useMutation({
    mutationFn: (input: SaveMarksInput) => assignmentsApi.saveMarks(assignmentId, input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: key });
      const seq = ++seqRef.current;
      // Last write wins inside one request too (§D.3).
      const wanted = new Map<string, HomeworkMarkInput>();
      for (const m of input.marks) wanted.set(m.studentId, m);
      for (const id of wanted.keys()) latestRef.current.set(id, seq);
      const previous = qc.getQueryData<AssignmentSubmissionRow[]>(key) ?? [];
      patch((row) => {
        const m = wanted.get(row.studentId);
        return m ? applyOptimistic(row, m) : row;
      });
      return { previous, seq, ids: [...wanted.keys()] };
    },
    onError: (_err, _input, ctx) => {
      if (!ctx) return;
      const before = new Map(ctx.previous.map((r) => [r.studentId, r]));
      patch((row) => {
        if (!ctx.ids.includes(row.studentId) || latestRef.current.get(row.studentId) !== ctx.seq) return row;
        return before.get(row.studentId) ?? row;
      });
    },
    onSuccess: (res, _input, ctx) => {
      if (!ctx) return;
      const fresh = new Map(res.marks.map((m) => [m.studentId, m]));
      patch((row) => {
        if (!ctx.ids.includes(row.studentId) || latestRef.current.get(row.studentId) !== ctx.seq) return row;
        const m = fresh.get(row.studentId);
        return m
          ? { ...row, state: m.state, score: m.score, scoreMax: m.scoreMax, editedAt: m.editedAt, required: m.required }
          : row;
      });
      // The list's per-assignment counters — but not the submissions we just patched.
      qc.invalidateQueries({ queryKey: [KEY], predicate: (q) => q.queryKey[2] !== 'submissions' });
    },
  });
}

export function useUploadAssignmentFile() {
  return useMutation({ mutationFn: assignmentsApi.uploadFile });
}
