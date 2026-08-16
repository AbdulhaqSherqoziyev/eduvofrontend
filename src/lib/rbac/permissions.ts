/**
 * Permission codes — the single source of truth on the client, mirroring the
 * backend `permissions.constants.ts`. Gate UI with these codes (never role
 * names). `*.delete` always means soft delete.
 */
export const PERMISSIONS = {
  STUDENT: ['student.read', 'student.create', 'student.update', 'student.delete'],
  GROUP: ['group.read', 'group.create', 'group.update', 'group.delete'],
  TEACHER: ['teacher.read', 'teacher.create', 'teacher.update', 'teacher.delete'],
  SUBJECT: ['subject.read', 'subject.create', 'subject.update', 'subject.delete'],
  ATTENDANCE: ['attendance.read', 'attendance.mark', 'attendance.edit'],
  ASSIGNMENT: ['assignment.read', 'assignment.create', 'assignment.update', 'assignment.grade'],
  PAYMENT: ['payment.read', 'payment.create', 'payment.delete'],
  TRANSACTION: ['transaction.read', 'transaction.create'],
  LESSON: ['lesson.read', 'lesson.update'],
  REPORT: ['report.finance', 'report.attendance', 'report.teacher'],
  ROLE: ['role.read', 'role.create', 'role.update', 'role.assign'],
  // `payroll.self` — O'Z hisobi, `payroll.read` — hammaniki. Ikkisi ataylab
  // alohida: ustozga `payroll.read` berish S1 ni buzadi (payroll spec §H.1).
  PAYROLL: ['payroll.read', 'payroll.self', 'payroll.approve', 'payroll.pay'],
  // `teacher.update` ga bog'lanmaydi: telefon raqamini tuzatadigan resepsion
  // maoshni ko'rmasin [S5.2].
  COMPENSATION: ['compensation.update'],
} as const;

type Group = keyof typeof PERMISSIONS;
export type PermissionCode = (typeof PERMISSIONS)[Group][number];

export const ALL_PERMISSIONS: PermissionCode[] = Object.values(PERMISSIONS).flat() as PermissionCode[];
