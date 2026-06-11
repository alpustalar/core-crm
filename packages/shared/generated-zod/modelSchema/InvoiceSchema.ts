import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { Prisma } from '@prisma/client'
import { InvoiceStatusSchema } from '../inputTypeSchemas/InvoiceStatusSchema'

/////////////////////////////////////////
// INVOICE SCHEMA
/////////////////////////////////////////

export const InvoiceSchema = z.object({
  status: InvoiceStatusSchema,
  id: z.uuid(),
  clinicId: z.string(),
  patientId: z.string(),
  appointmentId: z.string().nullable(),
  paymentId: z.string().nullable(),
  amount: z.instanceof(Prisma.Decimal, { message: "Field 'amount' must be a Decimal. Location: ['Models', 'Invoice']"}),
  currency: z.string(),
  vatRate: z.number().int(),
  netTotal: z.instanceof(Prisma.Decimal, { message: "Field 'netTotal' must be a Decimal. Location: ['Models', 'Invoice']"}),
  vatTotal: z.instanceof(Prisma.Decimal, { message: "Field 'vatTotal' must be a Decimal. Location: ['Models', 'Invoice']"}),
  invoiceNumber: z.string().nullable(),
  issuedAt: z.coerce.date().nullable(),
  providerRef: z.string().nullable(),
  rawResponse: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  isDeleted: z.boolean(),
})

export type Invoice = z.infer<typeof InvoiceSchema>

export default InvoiceSchema;
