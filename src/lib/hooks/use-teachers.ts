import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { teachersApi } from '../api/teachers';
import type { CreateTeacherInput } from '../types/teacher';
import type { ListParams } from '../api/http';

const KEY = 'teachers';

export function useTeachers(params: ListParams = {}) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => teachersApi.list(params) });
}

export function useTeacherOptions() {
  const { data } = useTeachers({ pageSize: 100 });
  return (data?.items ?? []).map((t) => ({ value: t.id, label: t.fullName }));
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: [KEY] });
}

export function useCreateTeacher() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: teachersApi.create, onSuccess: invalidate });
}

export function useUpdateTeacher(id: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: Partial<CreateTeacherInput>) => teachersApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteTeacher() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: teachersApi.softDelete, onSuccess: invalidate });
}
