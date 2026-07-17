import { z } from 'zod';

export const directionSchema = z.object({
  name: z.string().min(2, 'Yo‘nalish nomini kiriting'),
  note: z.string().optional(),
});

export type DirectionFormValues = z.infer<typeof directionSchema>;
