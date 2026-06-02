import { z } from 'zod';

/////////////////////////////////////////
// POS DEVICE SCHEMA
/////////////////////////////////////////

export const PosDeviceSchema = z.object({
  id: z.uuid(),
  clinicId: z.string(),
  label: z.string(),
  terminalId: z.string(),
  merchantId: z.string(),
  host: z.string(),
  port: z.number().int(),
  isActive: z.boolean(),
  isDeleted: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type PosDevice = z.infer<typeof PosDeviceSchema>

export default PosDeviceSchema;
