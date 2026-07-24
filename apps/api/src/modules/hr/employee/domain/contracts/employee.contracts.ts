import { z } from 'zod';
import { EmploymentTypeSchema } from '@input-type-schemas/EmploymentTypeSchema';
import { EmployeeStatusSchema } from '@input-type-schemas/EmployeeStatusSchema';
import { CurrencySchema } from '@input-type-schemas/CurrencySchema';
import { Employee as IEmployee } from '@shared';
import { Pagination } from '@shared/common';
import { ResponseGroups } from '@common/constants/response-groups.constant';

// ==========================================
// SERİLEŞTİRME GRUPLARI (RESPONSE GROUPS)
// ==========================================
// Personel cevaplarının alan görünürlüğü. Hassas alanlar (nationalId, maaş)
// FINANCIAL/MANAGEMENT tier'ında; grupları EmployeePolicy üretir.
export const EmployeeResponseGroups = ResponseGroups;

export type EmployeeResponseGroup =
  (typeof EmployeeResponseGroups)[keyof typeof EmployeeResponseGroups];

// ==========================================
// EMPLOYEE — oluşturma / güncelleme
// organizationId + clinicId bağlamdan (actor) gelir — DTO'da yer almaz.
// ==========================================

export const CreateEmployeeSchema = z.object({
  id: z.uuid().optional(),
  organizationId: z.uuid(),
  clinicId: z.uuid(),
  userId: z.uuid().nullable().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email().nullable().optional(),
  phone: z.string().nullable().optional(),
  nationalId: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  employmentType: EmploymentTypeSchema,
  hireDate: z.coerce.date(),
  annualLeaveEntitlement: z.number().int().nonnegative().optional(),
});
export type CreateEmployeeProps = z.infer<typeof CreateEmployeeSchema>;

export const UpdateEmployeeSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.email().nullable().optional(),
  phone: z.string().nullable().optional(),
  nationalId: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  employmentType: EmploymentTypeSchema.optional(),
  annualLeaveEntitlement: z.number().int().nonnegative().optional(),
});
export type UpdateEmployeeProps = z.infer<typeof UpdateEmployeeSchema>;

// ==========================================
// EMPLOYEE CONTRACT — sözleşme (maaş/istihdam geçmişi)
// ==========================================

export const CreateEmployeeContractSchema = z.object({
  id: z.uuid().optional(),
  employeeId: z.uuid(),
  type: EmploymentTypeSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
  grossSalary: z.number().nonnegative(),
  currency: CurrencySchema.optional(),
});
export type CreateEmployeeContractProps = z.infer<
  typeof CreateEmployeeContractSchema
>;

// ==========================================
// Read-model'ler (query çıktısı)
// ==========================================

export interface EmployeeContractView {
  id: string;
  type: IEmployee['employmentType'];
  startDate: Date;
  endDate: Date | null;
  grossSalary: string;
  currency: string;
  isActive: boolean;
}

export type EmployeeWithContracts = IEmployee & {
  contracts: EmployeeContractView[];
};

export const FindEmployeesFilterSchema = z.object({
  clinicId: z.uuid(),
  status: EmployeeStatusSchema.optional(),
  pagination: z.custom<Pagination>(
    (val) => val !== null && typeof val === 'object'
  ),
});
export type FindEmployeesFilter = z.infer<typeof FindEmployeesFilterSchema>;
