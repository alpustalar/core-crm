import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'

/////////////////////////////////////////
// HOTELBEDS HOTEL SCHEMA
/////////////////////////////////////////

export const HotelbedsHotelSchema = z.object({
  id: z.string(),
  name: z.string(),
  categoryCode: z.string(),
  categoryName: z.string().nullable(),
  destinationCode: z.string(),
  destinationName: z.string().nullable(),
  address: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  images: JsonValueSchema.nullable(),
  phones: JsonValueSchema.nullable(),
  lastSyncedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type HotelbedsHotel = z.infer<typeof HotelbedsHotelSchema>

export default HotelbedsHotelSchema;
