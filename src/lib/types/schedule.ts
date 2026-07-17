export type WeekDay = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export interface ScheduleSession {
  id: string;
  day: WeekDay;
  time: string;
  startTime: string;
  endTime: string;
  groupName: string;
  teacherName: string;
  room: string;
  color?: string;
  isExtra: boolean;
  date?: string;
}

export interface CreateExtraLessonInput {
  groupId: string;
  roomId?: string;
  date: string;
  startTime: string;
  endTime?: string;
}

export const WEEK_DAYS: { key: WeekDay; label: string; short: string }[] = [
  { key: 'MON', label: 'Dushanba', short: 'Du' },
  { key: 'TUE', label: 'Seshanba', short: 'Se' },
  { key: 'WED', label: 'Chorshanba', short: 'Cho' },
  { key: 'THU', label: 'Payshanba', short: 'Pa' },
  { key: 'FRI', label: 'Juma', short: 'Ju' },
  { key: 'SAT', label: 'Shanba', short: 'Sha' },
  { key: 'SUN', label: 'Yakshanba', short: 'Yak' },
];
