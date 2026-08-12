import { z } from 'zod';

export const GetConsentTemplatesFilterSchema = z.object({
  clinicId: z.uuid(),
  isActive: z.coerce.boolean().optional(),
  sectorId: z.uuid().optional(),
});
