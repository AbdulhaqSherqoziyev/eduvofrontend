import { api } from './client';
import type { CreateRoleInput, PermissionGroup, Role, UpdateRolePermissionsInput } from '../types/role';

export const rolesApi = {
  list: () => api.get<Role[]>('/roles').then((r) => r.data),
  get: (id: string) => api.get<Role>(`/roles/${id}`).then((r) => r.data),
  permissionCatalog: () => api.get<PermissionGroup[]>('/roles/permissions').then((r) => r.data),
  create: (input: CreateRoleInput) => api.post<Role>('/roles', input).then((r) => r.data),
  updatePermissions: (id: string, input: UpdateRolePermissionsInput) =>
    api.patch<Role>(`/roles/${id}/permissions`, input).then((r) => r.data),
  assignUser: (id: string, userId: string) =>
    api.post(`/roles/${id}/assign`, { userId }).then((r) => r.data),
};
