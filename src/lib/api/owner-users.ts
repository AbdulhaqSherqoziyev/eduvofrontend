import { api } from './client';
import type { Paginated } from './http';
import type { CreateOwnerUserInput, OwnerUser, TenantRole, UpdateOwnerUserInput } from '../types/owner-users';

/** OWNER cross-tenant user endpoints (all under /platform/tenant-users). */
export const ownerUsersApi = {
  list: (params: { tenantId?: string; search?: string; page?: number; limit?: number }) =>
    api.get<Paginated<OwnerUser>>('/platform/tenant-users', { params }).then((r) => r.data),
  roles: (tenantId: string) =>
    api.get<TenantRole[]>('/platform/tenant-users/roles', { params: { tenantId } }).then((r) => r.data),
  create: (input: CreateOwnerUserInput) =>
    api.post<OwnerUser>('/platform/tenant-users', input).then((r) => r.data),
  update: (id: string, input: UpdateOwnerUserInput) =>
    api.patch<OwnerUser>(`/platform/tenant-users/${id}`, input).then((r) => r.data),
  resetPassword: (id: string, newPassword: string) =>
    api.post(`/platform/tenant-users/${id}/reset-password`, { newPassword }).then((r) => r.data),
  remove: (id: string) => api.delete(`/platform/tenant-users/${id}`).then((r) => r.data),
};
