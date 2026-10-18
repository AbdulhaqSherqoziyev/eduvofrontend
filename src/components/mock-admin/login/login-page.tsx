'use client';
/**
 * /login on the admin host. The handlers are the seam for the API: until Bekzod's auth contract
 * lands every call fails, so the screen shows its network error instead of a fake success.
 */
import { AdminLoginScreen } from './login-screen';
import type { AdminLoginHandlers } from './types';

const notConnected = () => Promise.reject(new Error('admin-mock auth API is not wired yet'));

const handlers: AdminLoginHandlers = {
  submitPassword: notConnected,
  submitCode: notConnected,
};

export function AdminLoginPage() {
  return <AdminLoginScreen handlers={handlers} />;
}
