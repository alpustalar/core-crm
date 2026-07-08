import { z } from 'zod';
import { PosProviderSchema } from '../inputTypeSchemas/PosProviderSchema'

/////////////////////////////////////////
// POS DEVICE SCHEMA
/////////////////////////////////////////

export const PosDeviceSchema = z.object({
  provider: PosProviderSchema,
  id: z.string(),
  clinicId: z.string(),
  terminalId: z.string().nullable(),
  merchantId: z.string().nullable(),
  deviceUniqueId: z.string().nullable(),
  label: z.string(),
  host: z.string().nullable(),
  port: z.number().int().nullable(),
  isActive: z.boolean(),
  isDeleted: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type PosDevice = z.infer<typeof PosDeviceSchema>

export default PosDeviceSchema;
