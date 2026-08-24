import { Pagination } from '@shared/common';

// ==========================================
// Read-model'ler
// ==========================================

/** Dönem içi toplam çalışma/fazla mesai özeti (payroll için girdi). */
export interface AttendanceSummary {
  daysRecorded: number;
  totalWorkedMinutes: number;
  totalOvertimeMinutes: number;
}

export interface FindAttendanceByEmployeeFilter {
  employeeId: string;
  from?: Date;
  to?: Date;
  pagination: Pagination;
}

export interface GetAttendanceSummaryFilter {
  employeeId: string;
  from: Date;
  to: Date;
}
