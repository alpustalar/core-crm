import { z } from 'zod';

/////////////////////////////////////////
// CONSENT FORM TEMPLATE SCHEMA
/////////////////////////////////////////

/**
 * Klinik-bazlı onam formu şablonu. Klinik çalışanları oluşturur/düzenler; içerik değişince
 * version artar (geçmiş metin burada değil, imzalanmış Submission'ların snapshot'ında yaşar).
 */
export const ConsentFormTemplateSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  clinicId: z.string(),
  sectorId: z.string().nullable(),
  title: z.string(),
  content: z.string(),
  version: z.number().int(),
  isActive: z.boolean(),
  createdByUserId: z.string(),
  updatedByUserId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ConsentFormTemplate = z.infer<typeof ConsentFormTemplateSchema>

export default ConsentFormTemplateSchema;
