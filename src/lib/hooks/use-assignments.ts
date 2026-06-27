import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assignmentsApi } from '../api/assignments';
import type { AssignmentListParams } from '../types/assignment';

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

export function useUploadAssignmentFile() {
  return useMutation({ mutationFn: assignmentsApi.uploadFile });
}
