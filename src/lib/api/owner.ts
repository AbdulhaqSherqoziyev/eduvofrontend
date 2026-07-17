import { api } from './client';
import type { Paginated } from './http';
import type { Session } from '../auth/types';
import type { CreateCenterInput, OwnerApplication, OwnerPlan, OwnerTenant, ProvisionResult } from '../types/owner';

export interface OverrideInput {
  customMonthlyFee?: number;
  customSetupFee?: number;
  discountPercent?: number;
  planId?: string;
  modules?: string[];
}

/** Platform OWNER endpoints (all under /platform/*, guarded by platform auth). */
export const ownerApi = {
  tenants: () => api.get<OwnerTenant[]>('/platform/tenants').then((r) => r.data),
  createTenant: (input: CreateCenterInput) =>
    api.post<ProvisionResult>('/platform/tenants', input).then((r) => r.data),
  updateTenant: (id: string, input: { name?: string; domain?: string }) =>
    api.patch(`/platform/tenants/${id}`, input).then((r) => r.data),
  archiveTenant: (id: string) => api.delete(`/platform/tenants/${id}`).then((r) => r.data),
  restoreTenant: (id: string) => api.post(`/platform/tenants/${id}/restore`).then((r) => r.data),
  impersonateTenant: (id: string) =>
    api.post<Session>(`/platform/impersonate/tenant/${id}`).then((r) => r.data),
  impersonateUser: (userId: string) =>
    api.post<Session>(`/platform/impersonate/user/${userId}`).then((r) => r.data),
  topup: (tenantId: string, amount: number, note?: string, method?: string) =>
    api.post(`/platform/tenants/${tenantId}/transactions/topup`, { amount, note, method }).then((r) => r.data),
  setStatus: (tenantId: string, status: string) =>
    api.patch(`/platform/subscriptions/${tenantId}/status`, { status }).then((r) => r.data),
  override: (tenantId: string, input: OverrideInput) =>
    api.patch(`/platform/subscriptions/${tenantId}/override`, input).then((r) => r.data),

  applications: () =>
    api.get<Paginated<OwnerApplication>>('/platform/applications', { params: { status: 'PENDING' } }).then((r) => r.data),
  approve: (id: string) => api.post<ProvisionResult>(`/platform/applications/${id}/approve`).then((r) => r.data),
  reject: (id: string, reason: string) =>
    api.post(`/platform/applications/${id}/reject`, { reason }).then((r) => r.data),

  plans: () => api.get<OwnerPlan[]>('/platform/plans').then((r) => r.data),
  createPlan: (input: Partial<OwnerPlan>) => api.post<OwnerPlan>('/platform/plans', input).then((r) => r.data),
  updatePlan: (id: string, input: Partial<OwnerPlan>) =>
    api.patch<OwnerPlan>(`/platform/plans/${id}`, input).then((r) => r.data),
};
