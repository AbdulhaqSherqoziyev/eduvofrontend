import { z } from 'zod';

export const studentSchema = z.object({
  fullName: z.string().min(2, 'Ism familiyani kiriting'),
  phone: z.string().min(7, 'Telefon raqamini kiriting'),
  groupId: z.string().optional(),
});

export type StudentFormValues = z.infer<typeof studentSchema>;
