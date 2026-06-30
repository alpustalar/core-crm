import { z } from 'zod';

/////////////////////////////////////////
// CLINIC IYZICO TERMINAL CONFIG SCHEMA
/////////////////////////////////////////

export const ClinicIyzicoTerminalConfigSchema = z.object({
  id: z.uuid(),
  clientId: z.string(),
  clientSecret: z.string(),
  username: z.string(),
  password: z.string(),
  clinicId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ClinicIyzicoTerminalConfig = z.infer<typeof ClinicIyzicoTerminalConfigSchema>

export default ClinicIyzicoTerminalConfigSchema;
