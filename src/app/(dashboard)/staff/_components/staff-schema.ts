import { z } from 'zod';

export const staffSchema = z.object({
  fullName: z.string().min(2, 'Ism familiyani kiriting'),
  phone: z.string().min(7, 'Telefon raqamini kiriting'),
  defaultRole: z.string().optional(),
  password: z.string().refine((v) => !v || v.length >= 6, 'Kamida 6 belgi').optional(),
});

export type StaffFormValues = z.infer<typeof staffSchema>;
