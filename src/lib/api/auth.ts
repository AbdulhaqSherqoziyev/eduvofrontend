import { api } from './client';
import type { LoginInput, Session, SessionUser } from '../auth/types';

/** Auth endpoints. Login is phone + password per the backend RBAC spec. */
export const authApi = {
  login: (input: LoginInput) =>
    api.post<Session>('/auth/login', input).then((r) => r.data),
  me: () => api.get<SessionUser>('/auth/me').then((r) => r.data),
};
