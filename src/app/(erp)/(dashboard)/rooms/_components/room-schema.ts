import { z } from 'zod';

const optionalCount = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
  z.number().int().positive('Musbat son kiriting').optional(),
);

export const roomSchema = z.object({
  name: z.string().min(1, 'Xona nomini kiriting'),
  capacity: optionalCount,
  note: z.string().optional(),
});

export type RoomFormValues = z.infer<typeof roomSchema>;
