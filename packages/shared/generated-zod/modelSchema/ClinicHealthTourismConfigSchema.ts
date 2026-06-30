import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'

/////////////////////////////////////////
// CLINIC HEALTH TOURISM CONFIG SCHEMA
/////////////////////////////////////////

/**
 * Kliniğin sağlık-turizmi (otel + transfer) config'i — Clinic'ten ayrıştırılmış 1:1
 * satellite. AI asistanının hangi otelleri (allowlist veya şehir) arayacağını ve
 * transferin hangi havalimanı/hedef üzerinden kurulacağını belirler.
 */
export const ClinicHealthTourismConfigSchema = z.object({
  defaultCurrency: CurrencySchema,
  id: z.uuid(),
  isEnabled: z.boolean(),
  destinationCode: z.string().nullable(),
  nearbyHotelCodes: z.string().array(),
  airportIata: z.string().nullable(),
  clinicLocationType: z.string().nullable(),
  clinicLocationCode: z.string().nullable(),
  pickupAddress: z.string().nullable(),
  serviceFeePercent: z.instanceof(Prisma.Decimal, { message: "Field 'serviceFeePercent' must be a Decimal. Location: ['Models', 'ClinicHealthTourismConfig']"}).nullable(),
  clinicId: z.string(),
  organizationId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ClinicHealthTourismConfig = z.infer<typeof ClinicHealthTourismConfigSchema>

export default ClinicHealthTourismConfigSchema;
