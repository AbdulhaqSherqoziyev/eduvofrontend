import { z } from 'zod';

export const roleSchema = z.object({
  name: z.string().min(2, 'Rol nomini kiriting'),
  description: z.string().optional(),
});

export type RoleFormValues = z.infer<typeof roleSchema>;
