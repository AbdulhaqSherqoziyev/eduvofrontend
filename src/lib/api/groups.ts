import { api } from './client';
import { cleanParams } from './http';
import type { Paginated, ListParams } from './http';
import type { CreateGroupInput, Group, RosterEntry } from '../types/group';

export const groupsApi = {
  list: (params: ListParams = {}) =>
    api.get<Paginated<Group>>('/groups', { params: cleanParams(params) }).then((r) => r.data),
  get: (id: string) => api.get<Group>(`/groups/${id}`).then((r) => r.data),
  roster: (id: string) => api.get<RosterEntry[]>(`/groups/${id}/roster`).then((r) => r.data),
  create: (input: CreateGroupInput) => api.post<Group>('/groups', input).then((r) => r.data),
  update: (id: string, input: Partial<CreateGroupInput>) =>
    api.patch<Group>(`/groups/${id}`, input).then((r) => r.data),
  softDelete: (id: string) => api.delete(`/groups/${id}`).then((r) => r.data),
};
