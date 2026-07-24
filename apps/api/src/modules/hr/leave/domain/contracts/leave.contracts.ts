import { z } from 'zod';
import { LeaveTypeSchema } from '@input-type-schemas/LeaveTypeSchema';
import { LeaveStatusSchema } from '@input-type-schemas/LeaveStatusSchema';
import { Pagination } from '@shared/common';

// ==========================================
// LEAVE REQUEST — talep (org+clinic bağlamdan gelir)
// ==========================================

export const RequestLeaveSchema = z.object({
  id: z.uuid().optional(),
  employeeId: z.uuid(),
  organizationId: z.uuid(),
  clinicId: z.uuid(),
  type: LeaveTypeSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  reason: z.string().nullable().optional(),
});
export type RequestLeaveProps = z.infer<typeof RequestLeaveSchema>;

// ==========================================
// Read-model'ler
// ==========================================

/** Yıllık izin bakiyesi (hak ediş vs. kullanılan onaylı ANNUAL gün). */
export interface LeaveBalance {
  entitlement: number;
  used: number;
  remaining: number;
}

export const FindLeavesByEmployeeFilterSchema = z.object({
  employeeId: z.uuid(),
  status: LeaveStatusSchema.optional(),
  pagination: z.custom<Pagination>(
    (val) => val !== null && typeof val === 'object'
  ),
});
export type FindLeavesByEmployeeFilter = z.infer<
  typeof FindLeavesByEmployeeFilterSchema
>;

export const FindPendingLeavesFilterSchema = z.object({
  clinicId: z.uuid(),
  pagination: z.custom<Pagination>(
    (val) => val !== null && typeof val === 'object'
  ),
});
export type FindPendingLeavesFilter = z.infer<
  typeof FindPendingLeavesFilterSchema
>;
