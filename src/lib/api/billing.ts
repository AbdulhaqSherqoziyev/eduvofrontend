import { api } from './client';

export interface BillingMe {
  balance: number;
  setupFee: number;
  monthlyFee: number;
  status: string | null;
  setupPaid: boolean;
}

/** Current tenant's billing snapshot (admins only — backend enforces). */
export const billingApi = {
  me: () => api.get<BillingMe>('/billing/me').then((r) => r.data),
};
