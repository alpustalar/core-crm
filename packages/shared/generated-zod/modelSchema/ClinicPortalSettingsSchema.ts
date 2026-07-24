import { z } from 'zod';

/////////////////////////////////////////
// CLINIC PORTAL SETTINGS SCHEMA
/////////////////////////////////////////

export const ClinicPortalSettingsSchema = z.object({
  id: z.string(),
  clinicId: z.string(),
  apiKey: z.string(),
  customDomain: z.string().nullable(),
  primaryColor: z.string(),
  customTitle: z.string().nullable(),
  showOnlineBooking: z.boolean(),
  showMedicalRecords: z.boolean(),
  showFinancials: z.boolean(),
  showRaysAndImages: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ClinicPortalSettings = z.infer<typeof ClinicPortalSettingsSchema>

export default ClinicPortalSettingsSchema;
