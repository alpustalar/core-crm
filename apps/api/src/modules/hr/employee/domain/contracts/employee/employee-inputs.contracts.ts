import { EmploymentTypeType as EmploymentType } from '@input-type-schemas/EmploymentTypeSchema';

// ==========================================
// EMPLOYEE — oluşturma / güncelleme
// organizationId + clinicId bağlamdan (actor) gelir — DTO'da yer almaz.
// ==========================================

export interface CreateEmployeeProps {
  id?: string;
  organizationId: string;
  clinicId: string;
  userId?: string | null;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  nationalId?: string | null;
  title?: string | null;
  department?: string | null;
  employmentType: EmploymentType;
  hireDate: Date;
  annualLeaveEntitlement?: number;
}

export interface UpdateEmployeeProps {
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
  nationalId?: string | null;
  title?: string | null;
  department?: string | null;
  employmentType?: EmploymentType;
  annualLeaveEntitlement?: number;
}
