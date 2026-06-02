import { z } from 'zod';

/////////////////////////////////////////
// CLINIC EXCEPTION SCHEMA
/////////////////////////////////////////

export const ClinicExceptionSchema = z.object({
  id: z.uuid(),
  date: z.coerce.date(),
  isClosed: z.boolean(),
  reason: z.string().nullable(),
  clinicId: z.string(),
})

export type ClinicException = z.infer<typeof ClinicExceptionSchema>

export default ClinicExceptionSchema;
