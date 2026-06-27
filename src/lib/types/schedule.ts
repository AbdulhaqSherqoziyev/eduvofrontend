export type WeekDay = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT';

export interface ScheduleSession {
  id: string;
  day: WeekDay;
  time: string;
  groupName: string;
  teacherName: string;
  room: string;
  color?: string;
}

export const WEEK_DAYS: { key: WeekDay; label: string; short: string }[] = [
  { key: 'MON', label: 'Dushanba', short: 'Du' },
  { key: 'TUE', label: 'Seshanba', short: 'Se' },
  { key: 'WED', label: 'Chorshanba', short: 'Cho' },
  { key: 'THU', label: 'Payshanba', short: 'Pa' },
  { key: 'FRI', label: 'Juma', short: 'Ju' },
  { key: 'SAT', label: 'Shanba', short: 'Sha' },
];
