import { useQuery } from '@tanstack/react-query';
import { scheduleApi } from '../api/schedule';
import type { ListParams } from '../api/http';

const KEY = 'schedule';

export function useWeeklySchedule(params: ListParams = {}) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => scheduleApi.week(params) });
}
