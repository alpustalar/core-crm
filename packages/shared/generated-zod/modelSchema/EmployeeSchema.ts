import { z } from 'zod';
import { EmploymentTypeSchema } from '../inputTypeSchemas/EmploymentTypeSchema'
import { EmployeeStatusSchema } from '../inputTypeSchemas/EmployeeStatusSchema'

/////////////////////////////////////////
// EMPLOYEE SCHEMA
/////////////////////////////////////////

/**
 * Personel (İK). organizationId + clinicId birlikte taşınır (franchise/finans konvansiyonu).
 * userId opsiyonel — sisteme giriş yapan kullanıcı/provider'a bounded-context bağı (relation değil).
 */
export const EmployeeSchema = z.object({
  employmentType: EmploymentTypeSchema,
  status: EmployeeStatusSchema,
  id: z.string(),
  organizationId: z.string(),
  clinicId: z.string(),
  userId: z.string().nullable(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  nationalId: z.string().nullable(),
  title: z.string().nullable(),
  department: z.string().nullable(),
  hireDate: z.coerce.date(),
  terminationDate: z.coerce.date().nullable(),
  annualLeaveEntitlement: z.number().int(),
  isDeleted: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Employee = z.infer<typeof EmployeeSchema>

export default EmployeeSchema;
