import { z } from 'zod';

export const directionSchema = z.object({
  name: z.string().min(2, 'Yo‘nalish nomini kiriting'),
  level: z.string().min(1, 'Darajani kiriting'),
  durationMonths: z.coerce.number().int().positive('Muddatni kiriting'),
  price: z.coerce.number().nonnegative('Narxni kiriting'),
});

export type DirectionFormValues = z.infer<typeof directionSchema>;
