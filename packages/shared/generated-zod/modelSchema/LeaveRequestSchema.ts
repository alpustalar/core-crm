import { z } from 'zod';
import { LeaveTypeSchema } from '../inputTypeSchemas/LeaveTypeSchema'
import { LeaveStatusSchema } from '../inputTypeSchemas/LeaveStatusSchema'

/////////////////////////////////////////
// LEAVE REQUEST SCHEMA
/////////////////////////////////////////

/**
 * İzin talebi. ANNUAL onaylandığında çalışanın yıllık hak edişinden düşülür.
 */
export const LeaveRequestSchema = z.object({
  type: LeaveTypeSchema,
  status: LeaveStatusSchema,
  id: z.string(),
  employeeId: z.string(),
  organizationId: z.string(),
  clinicId: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  days: z.number().int(),
  reason: z.string().nullable(),
  reviewedById: z.string().nullable(),
  reviewedAt: z.coerce.date().nullable(),
  reviewNote: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type LeaveRequest = z.infer<typeof LeaveRequestSchema>

export default LeaveRequestSchema;
