import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { Prisma } from '@prisma/client'
import { HotelbedsBookingStatusSchema } from '../inputTypeSchemas/HotelbedsBookingStatusSchema'
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'

/////////////////////////////////////////
// HOTELBEDS BOOKING SCHEMA
/////////////////////////////////////////

export const HotelbedsBookingSchema = z.object({
  status: HotelbedsBookingStatusSchema,
  currency: CurrencySchema,
  id: z.uuid(),
  reference: z.string(),
  hotelCode: z.string(),
  patientId: z.string().nullable(),
  leadId: z.string().nullable(),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  totalNet: z.instanceof(Prisma.Decimal, { message: "Field 'totalNet' must be a Decimal. Location: ['Models', 'HotelbedsBooking']"}),
  holderName: z.string(),
  holderSurname: z.string(),
  rooms: JsonValueSchema,
  remarks: z.string().nullable(),
  serviceFee: z.instanceof(Prisma.Decimal, { message: "Field 'serviceFee' must be a Decimal. Location: ['Models', 'HotelbedsBooking']"}).nullable(),
  organizationId: z.string(),
  clinicId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type HotelbedsBooking = z.infer<typeof HotelbedsBookingSchema>

export default HotelbedsBookingSchema;
