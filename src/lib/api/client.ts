import axios from 'axios';
import { getToken, clearSession } from '../auth/session';

/** Shared Axios instance. Components never import this directly — only api/*.ts. */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
});

// One login URL for everyone — no per-tenant subdomain / X-Tenant header. The
// JWT carries the tenant; the backend scopes every request from the token.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      clearSession();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
