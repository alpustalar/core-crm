import { z } from 'zod';

export const UpdateConsentTemplateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  sectorId: z.uuid().nullable().optional(),
});

export type UpdateConsentTemplate = z.infer<typeof UpdateConsentTemplateSchema>;
