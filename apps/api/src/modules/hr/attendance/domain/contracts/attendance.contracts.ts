import { z } from 'zod';
import { Pagination } from '@shared/common';

// ==========================================
// ATTENDANCE — check-in / manuel kayıt (HR düzeltmesi)
// organizationId + clinicId bağlamdan (actor) gelir.
// ==========================================

export const CheckInSchema = z.object({
  id: z.uuid().optional(),
  employeeId: z.uuid(),
  organizationId: z.uuid(),
  clinicId: z.uuid(),
});
export type CheckInProps = z.infer<typeof CheckInSchema>;

export const RecordAttendanceSchema = z.object({
  id: z.uuid().optional(),
  employeeId: z.uuid(),
  organizationId: z.uuid(),
  clinicId: z.uuid(),
  workDate: z.coerce.date(),
  checkInAt: z.coerce.date(),
  checkOutAt: z.coerce.date(),
  note: z.string().nullable().optional(),
});
export type RecordAttendanceProps = z.infer<typeof RecordAttendanceSchema>;

// ==========================================
// Read-model'ler
// ==========================================

/** Dönem içi toplam çalışma/fazla mesai özeti (payroll için girdi). */
export interface AttendanceSummary {
  daysRecorded: number;
  totalWorkedMinutes: number;
  totalOvertimeMinutes: number;
}

export const FindAttendanceByEmployeeFilterSchema = z.object({
  employeeId: z.uuid(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  pagination: z.custom<Pagination>(
    (val) => val !== null && typeof val === 'object'
  ),
});
export type FindAttendanceByEmployeeFilter = z.infer<
  typeof FindAttendanceByEmployeeFilterSchema
>;

export const GetAttendanceSummaryFilterSchema = z.object({
  employeeId: z.uuid(),
  from: z.coerce.date(),
  to: z.coerce.date(),
});
export type GetAttendanceSummaryFilter = z.infer<
  typeof GetAttendanceSummaryFilterSchema
>;
