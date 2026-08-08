import { z } from 'zod';
import { decimalSchema } from '../../common/decimal';
import { ExternalWorkOrderStatusSchema } from '../inputTypeSchemas/ExternalWorkOrderStatusSchema'
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'

/////////////////////////////////////////
// EXTERNAL WORK ORDER SCHEMA
/////////////////////////////////////////

export const ExternalWorkOrderSchema = z.object({
  status: ExternalWorkOrderStatusSchema,
  currency: CurrencySchema,
  id: z.string(),
  clinicId: z.string(),
  organizationId: z.string(),
  supplierId: z.string(),
  patientId: z.string().nullable(),
  treatmentId: z.string().nullable(),
  providerId: z.string().nullable(),
  referenceNo: z.string().nullable(),
  sentAt: z.coerce.date().nullable(),
  dueDate: z.coerce.date().nullable(),
  receivedAt: z.coerce.date().nullable(),
  fittedAt: z.coerce.date().nullable(),
  cancelledAt: z.coerce.date().nullable(),
  cancelReason: z.string().nullable(),
  agreedCost: decimalSchema("Field 'agreedCost' must be a Decimal. Location: ['Models', 'ExternalWorkOrder']").nullable(),
  actualCost: decimalSchema("Field 'actualCost' must be a Decimal. Location: ['Models', 'ExternalWorkOrder']").nullable(),
  remakeOfId: z.string().nullable(),
  remakeReason: z.string().nullable(),
  overdueNotifiedAt: z.coerce.date().nullable(),
  note: z.string().nullable(),
  createdById: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ExternalWorkOrder = z.infer<typeof ExternalWorkOrderSchema>

export default ExternalWorkOrderSchema;
