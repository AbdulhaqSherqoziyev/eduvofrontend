import { api } from './client';
import type { Profile } from '../types/user';

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export const profileApi = {
  get: () => api.get<Profile>('/auth/profile').then((r) => r.data),
  update: (input: { fullName?: string; phone?: string }) =>
    api.patch<Profile>('/auth/profile', input).then((r) => r.data),
  changePassword: (input: ChangePasswordInput) =>
    api.post('/auth/change-password', input).then((r) => r.data),
};
