import { api } from './client';
import { cleanParams } from './http';
import type { Paginated } from './http';
import type { ConvertLeadResponse, CreateLeadInput, Lead, LeadListParams, UpdateLeadInput } from '../types/lead';

export const leadsApi = {
  list: (params: LeadListParams) =>
    api.get<Paginated<Lead>>('/leads', { params: cleanParams(params) }).then((r) => r.data),
  create: (input: CreateLeadInput) => api.post<Lead>('/leads', input).then((r) => r.data),
  update: (id: string, input: UpdateLeadInput) =>
    api.patch<Lead>(`/leads/${id}`, input).then((r) => r.data),
  remove: (id: string) => api.delete<Lead>(`/leads/${id}`).then((r) => r.data),
  convert: (id: string) => api.post<ConvertLeadResponse>(`/leads/${id}/convert`).then((r) => r.data),
};
