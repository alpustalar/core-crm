import { z } from 'zod';
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
  id: z.string(),
  clinicId: z.string(),
  organizationId: z.string(),
  isEnabled: z.boolean(),
  destinationCode: z.string().nullable(),
  nearbyHotelCodes: z.string().array(),
  airportIata: z.string().nullable(),
  clinicLocationType: z.string().nullable(),
  clinicLocationCode: z.string().nullable(),
  pickupAddress: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ClinicHealthTourismConfig = z.infer<typeof ClinicHealthTourismConfigSchema>

export default ClinicHealthTourismConfigSchema;
