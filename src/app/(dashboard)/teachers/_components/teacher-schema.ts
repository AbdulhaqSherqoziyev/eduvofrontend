import { z } from 'zod';

export const teacherSchema = z.object({
  fullName: z.string().min(2, 'Ism familiyani kiriting'),
  phone: z.string().min(7, 'Telefon raqamini kiriting'),
  salary: z.string().min(1, 'Oylikni kiriting'),
  subjectId: z.string().optional(),
});

export type TeacherFormValues = z.infer<typeof teacherSchema>;
