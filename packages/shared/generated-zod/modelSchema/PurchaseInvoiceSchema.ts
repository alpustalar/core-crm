import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'

/////////////////////////////////////////
// PURCHASE INVOICE SCHEMA
/////////////////////////////////////////

export const PurchaseInvoiceSchema = z.object({
  currency: CurrencySchema,
  id: z.uuid(),
  clinicId: z.string(),
  organizationId: z.string(),
  supplierId: z.string(),
  invoiceNumber: z.string().nullable(),
  invoiceDate: z.coerce.date(),
  lineAccountCode: z.string(),
  vatRate: z.number().int(),
  netTotal: z.instanceof(Prisma.Decimal, { message: "Field 'netTotal' must be a Decimal. Location: ['Models', 'PurchaseInvoice']"}),
  vatTotal: z.instanceof(Prisma.Decimal, { message: "Field 'vatTotal' must be a Decimal. Location: ['Models', 'PurchaseInvoice']"}),
  grandTotal: z.instanceof(Prisma.Decimal, { message: "Field 'grandTotal' must be a Decimal. Location: ['Models', 'PurchaseInvoice']"}),
  status: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type PurchaseInvoice = z.infer<typeof PurchaseInvoiceSchema>

export default PurchaseInvoiceSchema;
