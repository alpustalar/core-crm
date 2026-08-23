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

/** Yıllık izin bakiyesi (hak ediş + devreden vs. kullanılan onaylı ANNUAL gün). */
export interface LeaveBalance {
  /** İçinde bulunulan izin yılında doğan hak ediş. */
  accrued: number;
  /** Önceki yıllardan devreden kullanılmamış gün (4857/53 — yıllık izin yanmaz). */
  carriedOver: number;
  /** Toplam kullanılabilir gün = `accrued + carriedOver`. */
  entitlement: number;
  used: number;
  remaining: number;
}

/**
 * Onaylı bir yıllık iznin tarih aralığı. Bakiye hesabı gün sayısını talebin kendi
 * `days` alanından değil bu aralıktan türetir: yıl aşan izinler yıllara bölünmeli.
 */
export interface AnnualLeavePeriod {
  startDate: Date;
  endDate: Date;
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
