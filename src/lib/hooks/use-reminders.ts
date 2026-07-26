import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { remindersApi } from '../api/reminders';
import type { ReminderStatus } from '../types/reminder';

const KEY = 'reminders';

export function useReminders(status: ReminderStatus = 'PENDING') {
  return useQuery({ queryKey: [KEY, status], queryFn: () => remindersApi.list(status) });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: [KEY] });
}

/** Send one reminder. Irreversible — always behind a confirm dialog. */
export function useSendReminder() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: remindersApi.send, onSuccess: invalidate });
}

export function useSkipReminder() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: remindersApi.skip, onSuccess: invalidate });
}
