import { api } from './client';
import type { Paginated } from './http';
import type { FinanceOverview, PlatformTxn, TenantTxn } from '../types/owner-finance';

export interface FinanceQuery {
  tenantId?: string;
  tenantType?: 'INCOME' | 'EXPENSE';
  platformType?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/** OWNER cross-tenant finance endpoints (all under /platform/finance). */
export const ownerFinanceApi = {
  overview: (tenantId?: string) =>
    api.get<FinanceOverview>('/platform/finance/overview', { params: { tenantId } }).then((r) => r.data),
  platformTxns: (q: FinanceQuery) =>
    api.get<Paginated<PlatformTxn>>('/platform/finance/platform-transactions', { params: q }).then((r) => r.data),
  tenantTxns: (q: FinanceQuery) =>
    api.get<Paginated<TenantTxn>>('/platform/finance/tenant-transactions', { params: q }).then((r) => r.data),
  voidPlatformTxn: (id: string) =>
    api.post(`/platform/finance/platform-transactions/${id}/void`).then((r) => r.data),
  voidTenantTxn: (id: string) =>
    api.post(`/platform/finance/tenant-transactions/${id}/void`).then((r) => r.data),
};
