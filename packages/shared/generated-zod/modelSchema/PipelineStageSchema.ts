import { z } from 'zod';
import { PipelineStageTypeSchema } from '../inputTypeSchemas/PipelineStageTypeSchema'

/////////////////////////////////////////
// PIPELINE STAGE SCHEMA
/////////////////////////////////////////

/**
 * Huni içindeki sıralı aşama (ör. Yeni → Nitelikli → Teklif → Kazanıldı/Kaybedildi).
 * `order` sıralamayı, `type` sistem davranışını (WON/LOST senkronu) belirler.
 */
export const PipelineStageSchema = z.object({
  type: PipelineStageTypeSchema,
  id: z.string(),
  pipelineId: z.string(),
  name: z.string(),
  order: z.number().int(),
  color: z.string().nullable(),
  isDeleted: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type PipelineStage = z.infer<typeof PipelineStageSchema>

export default PipelineStageSchema;
