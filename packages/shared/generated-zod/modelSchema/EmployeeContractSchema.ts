import { z } from 'zod';
import { decimalSchema } from '../../common/decimal';
import { EmploymentTypeSchema } from '../inputTypeSchemas/EmploymentTypeSchema'
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'

/////////////////////////////////////////
// EMPLOYEE CONTRACT SCHEMA
/////////////////////////////////////////

/**
 * Çalışan sözleşmesi (maaş/istihdam geçmişi). Aynı anda tek aktif sözleşme beklenir.
 */
export const EmployeeContractSchema = z.object({
  type: EmploymentTypeSchema,
  currency: CurrencySchema,
  id: z.string(),
  employeeId: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  grossSalary: decimalSchema("Field 'grossSalary' must be a Decimal. Location: ['Models', 'EmployeeContract']"),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type EmployeeContract = z.infer<typeof EmployeeContractSchema>

export default EmployeeContractSchema;
