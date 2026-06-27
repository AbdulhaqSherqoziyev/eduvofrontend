import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ownerUsersApi } from '../api/owner-users';
import type { CreateOwnerUserInput, UpdateOwnerUserInput } from '../types/owner-users';

const KEY = 'owner-users';

export function useOwnerUsers(params: { tenantId?: string; search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => ownerUsersApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useTenantRoles(tenantId?: string) {
  return useQuery({
    queryKey: ['owner-tenant-roles', tenantId],
    queryFn: () => ownerUsersApi.roles(tenantId as string),
    enabled: !!tenantId,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: [KEY] });
}

export function useCreateOwnerUser() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (input: CreateOwnerUserInput) => ownerUsersApi.create(input), onSuccess: invalidate });
}

export function useUpdateOwnerUser(id: string) {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (input: UpdateOwnerUserInput) => ownerUsersApi.update(id, input), onSuccess: invalidate });
}

export function useResetOwnerUserPassword(id: string) {
  return useMutation({ mutationFn: (newPassword: string) => ownerUsersApi.resetPassword(id, newPassword) });
}

export function useDeleteOwnerUser() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => ownerUsersApi.remove(id), onSuccess: invalidate });
}
