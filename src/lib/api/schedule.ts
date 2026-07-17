import { api } from './client';
import { cleanParams } from './http';
import type { ListParams } from './http';
import type { CreateExtraLessonInput, ScheduleSession } from '../types/schedule';

export const scheduleApi = {
  week: (params: ListParams = {}) =>
    api.get<ScheduleSession[]>('/schedule', { params: cleanParams(params) }).then((r) => r.data),
  createExtra: (input: CreateExtraLessonInput) =>
    api.post<ScheduleSession>('/schedule/extra', input).then((r) => r.data),
};
