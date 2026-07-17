import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentsApi } from '../api/students';
import type {
  CreateStudentInput, ParentCredentialsInput, SetStudentCredentialsInput, StudentListParams,
} from '../types/student';

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

export function useStudentProfile(id: string) {
  return useQuery({ queryKey: [KEY, id, 'profile'], queryFn: () => studentsApi.profile(id), enabled: !!id });
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

export function useImportStudents() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: studentsApi.importStudents, onSuccess: invalidate });
}

export function useGenerateCredentials() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: studentsApi.generateCredentials, onSuccess: invalidate });
}

export function useStudentCredentials(id: string, enabled: boolean) {
  return useQuery({
    queryKey: [KEY, id, 'credentials'],
    queryFn: () => studentsApi.getCredentials(id),
    enabled: enabled && !!id,
  });
}

/** All credential mutations refresh that student's credentials view. */
function useCredMutation<T>(id: string, fn: (input: T) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, id, 'credentials'] }),
  });
}

export function useSetStudentCredentials(id: string) {
  return useCredMutation(id, (input: SetStudentCredentialsInput) => studentsApi.setCredentials(id, input));
}

export function useCreateParent(id: string) {
  return useCredMutation(id, (input: ParentCredentialsInput) => studentsApi.createParent(id, input));
}

export function useSetParentCredentials(id: string, parentId: string) {
  return useCredMutation(id, (input: ParentCredentialsInput) =>
    studentsApi.setParentCredentials(id, parentId, input));
}
