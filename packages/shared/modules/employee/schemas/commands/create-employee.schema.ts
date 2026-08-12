import { z } from 'zod';
import EmploymentTypeSchema from '@shared/generated-zod/inputTypeSchemas/EmploymentTypeSchema';
import CurrencySchema from '@shared/generated-zod/inputTypeSchemas/CurrencySchema';

/** Çalışan oluşturma. organizationId/clinicId bağlamdan (aktif klinik) gelir — DTO'da yer almaz. */
export const CreateEmployeeSchema = z.object({
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
  // Verilirse başlangıç sözleşmesi de oluşturulur.
  grossSalary: z.number().nonnegative().optional(),
  currency: CurrencySchema.optional(),
  clinicId: z.uuid()
});

export type CreateEmployee = z.infer<typeof CreateEmployeeSchema>;
