import { z } from 'zod';

/////////////////////////////////////////
// PROVIDER SHIFT SCHEMA
/////////////////////////////////////////

export const ProviderShiftSchema = z.object({
  id: z.uuid(),
  providerId: z.string(),
  date: z.coerce.date(),
  startMinute: z.number().int(),
  endMinute: z.number().int(),
  breakStartMinute: z.number().int().nullable(),
  breakEndMinute: z.number().int().nullable(),
})

export type ProviderShift = z.infer<typeof ProviderShiftSchema>

export default ProviderShiftSchema;
