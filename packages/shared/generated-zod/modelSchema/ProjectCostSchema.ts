import { z } from 'zod';
import { decimalSchema } from '../../common/decimal';
import { ProjectCostSourceSchema } from '../inputTypeSchemas/ProjectCostSourceSchema'
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'

/////////////////////////////////////////
// PROJECT COST SCHEMA
/////////////////////////////////////////

export const ProjectCostSchema = z.object({
  source: ProjectCostSourceSchema,
  currency: CurrencySchema,
  id: z.string(),
  projectId: z.string(),
  phaseId: z.string().nullable(),
  clinicId: z.string(),
  organizationId: z.string(),
  /**
   * Kaynak kaydın id'si (purchaseInvoiceId / workOrderId / payrollRunId). MANUAL'da null.
   */
  sourceRefId: z.string().nullable(),
  description: z.string(),
  amount: decimalSchema("Field 'amount' must be a Decimal. Location: ['Models', 'ProjectCost']"),
  incurredAt: z.coerce.date(),
  recordedById: z.string(),
  createdAt: z.coerce.date(),
})

export type ProjectCost = z.infer<typeof ProjectCostSchema>

export default ProjectCostSchema;
