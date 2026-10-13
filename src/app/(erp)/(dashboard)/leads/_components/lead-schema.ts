import { z } from 'zod';

/** Only two required fields (Sevara: keep the form tiny). */
export const leadSchema = z.object({
  fullName: z.string().min(2, 'Ism familiyani kiriting'),
  phone: z.string().min(7, 'Telefon raqamini kiriting'),
  source: z.string().optional(),
  note: z.string().optional(),
});

export type LeadFormValues = z.infer<typeof leadSchema>;
