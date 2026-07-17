import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { scheduleApi } from '../api/schedule';
import type { ListParams } from '../api/http';

const KEY = 'schedule';

export function useWeeklySchedule(params: ListParams = {}) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => scheduleApi.week(params) });
}

export function useCreateExtraLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: scheduleApi.createExtra,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
