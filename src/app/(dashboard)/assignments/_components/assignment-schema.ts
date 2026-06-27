import { z } from 'zod';

export const assignmentSchema = z.object({
  title: z.string().min(2, 'Vazifa nomini kiriting'),
  groupId: z.string().min(1, 'Guruhni tanlang'),
  dueDate: z.string().min(1, 'Muddatni tanlang'),
  description: z.string().optional(),
});

export type AssignmentFormValues = z.infer<typeof assignmentSchema>;
