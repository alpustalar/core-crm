import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { Prisma } from '@prisma/client'
import { HotelbedsTransferBookingStatusSchema } from '../inputTypeSchemas/HotelbedsTransferBookingStatusSchema'
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'

/////////////////////////////////////////
// HOTELBEDS TRANSFER BOOKING SCHEMA
/////////////////////////////////////////

export const HotelbedsTransferBookingSchema = z.object({
  status: HotelbedsTransferBookingStatusSchema,
  currency: CurrencySchema,
  id: z.uuid(),
  reference: z.string(),
  clientReference: z.string().nullable(),
  holderName: z.string(),
  holderSurname: z.string(),
  holderEmail: z.string(),
  holderPhone: z.string(),
  transfers: JsonValueSchema,
  totalAmount: z.instanceof(Prisma.Decimal, { message: "Field 'totalAmount' must be a Decimal. Location: ['Models', 'HotelbedsTransferBooking']"}),
  remarks: z.string().nullable(),
  organizationId: z.string(),
  clinicId: z.string().nullable(),
  patientId: z.string().nullable(),
  leadId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type HotelbedsTransferBooking = z.infer<typeof HotelbedsTransferBookingSchema>

export default HotelbedsTransferBookingSchema;
