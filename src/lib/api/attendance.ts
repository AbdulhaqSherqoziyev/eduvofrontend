import { api } from './client';
import { cleanParams } from './http';
import type { AttendanceSheet, SaveAttendanceInput } from '../types/attendance';

export const attendanceApi = {
  /** Today's lesson + marks for a group (defaults to the next/current lesson). */
  sheet: (params: { groupId?: string; lessonId?: string } = {}) =>
    api.get<AttendanceSheet>('/attendance/sheet', { params: cleanParams(params) }).then((r) => r.data),
  save: (input: SaveAttendanceInput) =>
    api.post<AttendanceSheet>('/attendance/marks', input).then((r) => r.data),
};
