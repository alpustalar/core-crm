import { LeaveTypeType as LeaveType } from '@input-type-schemas/LeaveTypeSchema';

// ==========================================
// LEAVE REQUEST — talep (org+clinic bağlamdan gelir)
// ==========================================

export interface RequestLeaveProps {
  id?: string;
  employeeId: string;
  organizationId: string;
  clinicId: string;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  reason?: string | null;
}
