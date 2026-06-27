/** Subject = "Yo'nalish" (direction/course track). */
export interface Subject {
  id: string;
  name: string;
  level: string;
  durationMonths: number;
  price: number;
  groupCount: number;
  studentCount: number;
}

export interface CreateSubjectInput {
  name: string;
  level: string;
  durationMonths: number;
  price: number;
}
