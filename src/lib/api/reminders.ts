import { api } from './client';
import type { Reminder, ReminderStatus } from '../types/reminder';

/**
 * Debt-reminder worklist. Admin-only and behind the `reminders` module — the
 * backend answers 403 MODULE_DISABLED when it is off.
 *
 * There is no bulk endpoint on purpose: sending is one row, one decision.
 */
export const remindersApi = {
  list: (status: ReminderStatus = 'PENDING') =>
    api.get<Reminder[]>('/billing/reminders', { params: { status } }).then((r) => r.data),
  send: (id: string) =>
    api.post<{ ok: true }>(`/billing/reminders/${id}/send`).then((r) => r.data),
  skip: (id: string) =>
    api.post<{ ok: true }>(`/billing/reminders/${id}/skip`).then((r) => r.data),
};
