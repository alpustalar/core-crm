import { z } from 'zod';

/** İzin onay/ret notu (opsiyonel). */
export const ReviewLeaveSchema = z.object({
  note: z.string().nullable().optional(),
});

export type ReviewLeave = z.infer<typeof ReviewLeaveSchema>;