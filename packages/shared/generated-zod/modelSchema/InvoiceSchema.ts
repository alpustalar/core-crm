import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { decimalSchema } from '../../common/decimal';
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'
import { InvoiceStatusSchema } from '../inputTypeSchemas/InvoiceStatusSchema'
import { EDocumentTypeSchema } from '../inputTypeSchemas/EDocumentTypeSchema'
import { EDocumentStatusSchema } from '../inputTypeSchemas/EDocumentStatusSchema'

/////////////////////////////////////////
// INVOICE SCHEMA
/////////////////////////////////////////

export const InvoiceSchema = z.object({
  currency: CurrencySchema,
  status: InvoiceStatusSchema,
  documentType: EDocumentTypeSchema.nullable(),
  einvoiceStatus: EDocumentStatusSchema,
  id: z.string(),
  organizationId: z.string(),
  clinicId: z.string(),
  patientId: z.string(),
  appointmentId: z.string().nullable(),
  paymentId: z.string().nullable(),
  amount: decimalSchema("Field 'amount' must be a Decimal. Location: ['Models', 'Invoice']"),
  vatRate: z.number().int(),
  netTotal: decimalSchema("Field 'netTotal' must be a Decimal. Location: ['Models', 'Invoice']"),
  vatTotal: decimalSchema("Field 'vatTotal' must be a Decimal. Location: ['Models', 'Invoice']"),
  invoiceNumber: z.string().nullable(),
  issuedAt: z.coerce.date().nullable(),
  einvoiceUuid: z.string().nullable(),
  providerRef: z.string().nullable(),
  rawResponse: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  isDeleted: z.boolean(),
})

export type Invoice = z.infer<typeof InvoiceSchema>

export default InvoiceSchema;
