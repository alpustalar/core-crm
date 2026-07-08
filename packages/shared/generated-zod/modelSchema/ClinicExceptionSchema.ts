import { z } from 'zod';

/////////////////////////////////////////
// CLINIC EXCEPTION SCHEMA
/////////////////////////////////////////

export const ClinicExceptionSchema = z.object({
  id: z.string(),
  clinicId: z.string(),
  date: z.coerce.date(),
  isClosed: z.boolean(),
  reason: z.string().nullable(),
})

export type ClinicException = z.infer<typeof ClinicExceptionSchema>

export default ClinicExceptionSchema;
