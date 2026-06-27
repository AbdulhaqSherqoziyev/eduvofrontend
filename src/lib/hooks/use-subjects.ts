import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { subjectsApi } from '../api/subjects';
import type { CreateSubjectInput } from '../types/subject';
import type { ListParams } from '../api/http';

const KEY = 'subjects';

export function useSubjects(params: ListParams = {}) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => subjectsApi.list(params) });
}

export function useSubjectOptions() {
  const { data } = useSubjects({ pageSize: 100 });
  return (data?.items ?? []).map((s) => ({ value: s.id, label: s.name }));
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: [KEY] });
}

export function useCreateSubject() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: subjectsApi.create, onSuccess: invalidate });
}

export function useUpdateSubject(id: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: Partial<CreateSubjectInput>) => subjectsApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteSubject() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: subjectsApi.softDelete, onSuccess: invalidate });
}
