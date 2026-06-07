import { z } from 'zod';

const OccupancySchema = z.object({
  rooms: z.number().int().positive().default(1),
  adults: z.number().int().positive(),
  children: z.number().int().min(0).default(0),
});

export const SearchHotelsSchema = z.object({
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  occupancies: z.array(OccupancySchema).min(1),
  destinationCode: z.string().optional(),
  hotelCodes: z.array(z.string()).optional(),
});
