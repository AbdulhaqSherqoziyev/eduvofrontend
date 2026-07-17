import { api } from './client';
import type { TenantSettings } from '../types/tenant';

/** Tenant settings endpoint (tenant resolved from the auth token, not a subdomain). */
export const tenantApi = {
  settings: () => api.get<TenantSettings>('/tenant/settings').then((r) => r.data),
  updateSettings: (payload: Partial<TenantSettings>) =>
    api.patch<TenantSettings>('/tenant/settings', payload).then((r) => r.data),
};
