import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentsApi } from '../api/students';
import type { CreateStudentInput, StudentListParams } from '../types/student';

const KEY = 'students';

export function useStudents(params: StudentListParams) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => studentsApi.list(params) });
}

export function useDeletedStudents(params: StudentListParams) {
  return useQuery({ queryKey: [KEY, 'trash', params], queryFn: () => studentsApi.listDeleted(params) });
}

export function useStudent(id: string) {
  return useQuery({ queryKey: [KEY, id], queryFn: () => studentsApi.get(id), enabled: !!id });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: [KEY] });
}

export function useCreateStudent() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: studentsApi.create, onSuccess: invalidate });
}

export function useUpdateStudent(id: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: Partial<CreateStudentInput>) => studentsApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteStudent() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: studentsApi.softDelete, onSuccess: invalidate });
}

export function useRestoreStudent() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: studentsApi.restore, onSuccess: invalidate });
}
