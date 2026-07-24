import { z } from 'zod';
import PipelineStageTypeSchema from '@shared/generated-zod/inputTypeSchemas/PipelineStageTypeSchema';

/** Aşamayı günceller (yalnız gönderilen alanlar). */
export const UpdatePipelineStageSchema = z.object({
  name: z.string().min(1).optional(),
  order: z.number().int().nonnegative().optional(),
  type: PipelineStageTypeSchema.optional(),
  color: z.string().min(1).nullable().optional(),
});
