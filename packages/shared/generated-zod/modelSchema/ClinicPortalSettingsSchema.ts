import { z } from 'zod';

/////////////////////////////////////////
// CLINIC PORTAL SETTINGS SCHEMA
/////////////////////////////////////////

export const ClinicPortalSettingsSchema = z.object({
  id: z.uuid(),
  apiKey: z.uuid(),
  primaryColor: z.string(),
  customTitle: z.string().nullable(),
  clinicId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ClinicPortalSettings = z.infer<typeof ClinicPortalSettingsSchema>

export default ClinicPortalSettingsSchema;
