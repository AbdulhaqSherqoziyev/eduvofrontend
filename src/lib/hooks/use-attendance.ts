import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendance';

const KEY = 'attendance';

export function useAttendanceSheet(params: { groupId?: string; lessonId?: string } = {}) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => attendanceApi.sheet(params) });
}

export function useSaveAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: attendanceApi.save,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
