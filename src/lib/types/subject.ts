/** Subject = "Yo'nalish" (direction/course track). Just name + note now. */
export interface Subject {
  id: string;
  name: string;
  note: string;
  level: string;
  durationMonths: number;
  price: number;
  groupCount: number;
  studentCount: number;
}

export interface CreateSubjectInput {
  name: string;
  note?: string;
}
