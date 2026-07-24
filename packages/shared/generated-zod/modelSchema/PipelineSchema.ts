import { z } from 'zod';

/////////////////////////////////////////
// PIPELINE SCHEMA
/////////////////////////////////////////

/**
 * Klinik-seviye satış hunisi (organizationId denormalize — org+klinik birlikte taşınır).
 * Her kliniğe bir varsayılan huni seed'lenir; ekipler kendi hunilerini/aşamalarını
 * düzenleyebilir. Lead'ler aşamalara (stage) bağlanır.
 */
export const PipelineSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  clinicId: z.string(),
  name: z.string(),
  isDefault: z.boolean(),
  isDeleted: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Pipeline = z.infer<typeof PipelineSchema>

export default PipelineSchema;
