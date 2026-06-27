import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import type { UpdateStaffInput } from '../types/user';
import type { ListParams } from '../api/http';

const KEY = 'users';

export function useUsers(params: ListParams = {}) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => usersApi.list(params) });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: [KEY] });
}

export function useCreateUser() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: usersApi.create, onSuccess: invalidate });
}

export function useUpdateUser(id: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: UpdateStaffInput) => usersApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useResetUserPassword(id: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (newPassword: string) => usersApi.resetPassword(id, newPassword),
    onSuccess: invalidate,
  });
}

export function useDeleteUser() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: usersApi.remove, onSuccess: invalidate });
}
