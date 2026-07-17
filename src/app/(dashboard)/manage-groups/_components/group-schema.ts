import { z } from 'zod';

export const groupSchema = z.object({
  name: z.string().min(2, 'Guruh nomini kiriting'),
  subjectId: z.string().optional(),
  teacherId: z.string().optional(),
  roomId: z.string().optional(),
  schedule: z.string().min(1, 'Dars kunlarini tanlang'),
  startTime: z.string().min(1, 'Vaqtni kiriting'),
  endTime: z.string().optional(),
  level: z.string().min(1, 'Darajani tanlang'),
  price: z.string().min(1, 'Narxni kiriting'),
});

export type GroupFormValues = z.infer<typeof groupSchema>;
