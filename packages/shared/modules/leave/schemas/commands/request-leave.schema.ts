import { z } from 'zod';
import LeaveTypeSchema from '@shared/generated-zod/inputTypeSchemas/LeaveTypeSchema';

/** İzin talebi. Gün sayısı backend'de (inclusive) hesaplanır. */
export const RequestLeaveSchema = z.object({
  type: LeaveTypeSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  reason: z.string().nullable().optional(),
  clinicId: z.uuid(),
});

export type RequestLeave = z.infer<typeof RequestLeaveSchema>;
