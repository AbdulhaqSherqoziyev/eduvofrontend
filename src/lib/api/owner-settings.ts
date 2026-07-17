import { api } from './client';

export interface Offerta {
  value: string;
  updatedAt: string | null;
}

/** OWNER-editable global settings (public offerta shown on the landing page). */
export interface SetupFee {
  value: number;
}

export const ownerSettingsApi = {
  getOfferta: () => api.get<Offerta>('/platform/offerta').then((r) => r.data),
  setOfferta: (value: string) => api.patch<Offerta>('/platform/offerta', { value }).then((r) => r.data),
  getSetupFee: () => api.get<SetupFee>('/platform/setup-fee').then((r) => r.data),
  setSetupFee: (value: number) => api.patch<SetupFee>('/platform/setup-fee', { value }).then((r) => r.data),
};
