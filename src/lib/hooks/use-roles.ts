import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '../api/roles';
import type { UpdateRolePermissionsInput } from '../types/role';

const KEY = 'roles';

export function useRoles() {
  return useQuery({ queryKey: [KEY], queryFn: rolesApi.list });
}

export function usePermissionCatalog() {
  return useQuery({ queryKey: [KEY, 'catalog'], queryFn: rolesApi.permissionCatalog, staleTime: 5 * 60_000 });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: [KEY] });
}

export function useCreateRole() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: rolesApi.create, onSuccess: invalidate });
}

export function useUpdateRolePermissions(id: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: UpdateRolePermissionsInput) => rolesApi.updatePermissions(id, input),
    onSuccess: invalidate,
  });
}

export function useAssignRole(id: string) {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (userId: string) => rolesApi.assignUser(id, userId), onSuccess: invalidate });
}
