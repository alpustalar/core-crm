// ==========================================
// ATTENDANCE RECORD — check-in / manuel kayıt (HR düzeltmesi)
// organizationId + clinicId bağlamdan (actor) gelir.
// ==========================================

export interface CheckInProps {
  id?: string;
  employeeId: string;
  organizationId: string;
  clinicId: string;
}

export interface RecordAttendanceProps {
  id?: string;
  employeeId: string;
  organizationId: string;
  clinicId: string;
  workDate: Date;
  checkInAt: Date;
  checkOutAt: Date;
  note?: string | null;
}
