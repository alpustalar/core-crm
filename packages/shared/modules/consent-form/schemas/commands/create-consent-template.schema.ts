import { z } from 'zod';

export const CreateConsentTemplateSchema = z.object({
  clinicId: z.uuid(),
  sectorId: z.uuid().nullable().optional(),
  title: z.string().min(1),
  content: z.string().min(1),
});

export type CreateConsentTemplate = z.infer<typeof CreateConsentTemplateSchema>;
