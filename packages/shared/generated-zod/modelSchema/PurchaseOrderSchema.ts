import { z } from 'zod';
import { decimalSchema } from '../../common/decimal';
import { PurchaseOrderStatusSchema } from '../inputTypeSchemas/PurchaseOrderStatusSchema'
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'

/////////////////////////////////////////
// PURCHASE ORDER SCHEMA
/////////////////////////////////////////

export const PurchaseOrderSchema = z.object({
  status: PurchaseOrderStatusSchema,
  currency: CurrencySchema,
  id: z.string(),
  clinicId: z.string(),
  organizationId: z.string(),
  supplierId: z.string(),
  purchaseRequestId: z.string().nullable(),
  orderDate: z.coerce.date(),
  expectedDate: z.coerce.date().nullable(),
  netTotal: decimalSchema("Field 'netTotal' must be a Decimal. Location: ['Models', 'PurchaseOrder']"),
  vatTotal: decimalSchema("Field 'vatTotal' must be a Decimal. Location: ['Models', 'PurchaseOrder']"),
  grandTotal: decimalSchema("Field 'grandTotal' must be a Decimal. Location: ['Models', 'PurchaseOrder']"),
  note: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type PurchaseOrder = z.infer<typeof PurchaseOrderSchema>

export default PurchaseOrderSchema;
