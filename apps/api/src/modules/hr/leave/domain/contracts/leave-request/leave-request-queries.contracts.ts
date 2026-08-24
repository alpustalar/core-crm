import { LeaveStatusType as LeaveStatus } from '@input-type-schemas/LeaveStatusSchema';
import { Pagination } from '@shared/common';

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

export interface FindLeavesByEmployeeFilter {
  employeeId: string;
  status?: LeaveStatus;
  pagination: Pagination;
}

export interface FindPendingLeavesFilter {
  clinicId: string;
  pagination: Pagination;
}
