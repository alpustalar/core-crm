import { z } from 'zod';
import EmploymentTypeSchema from '@shared/generated-zod/inputTypeSchemas/EmploymentTypeSchema';

/** Çalışan güncelleme — yalnız gönderilen alanlar değişir. */
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

export type UpdateEmployee = z.infer<typeof UpdateEmployeeSchema>;