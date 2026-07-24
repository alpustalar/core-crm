import { z } from 'zod';
import PipelineStageTypeSchema from '@shared/generated-zod/inputTypeSchemas/PipelineStageTypeSchema';

/** Huniye yeni aşama ekler. pipelineId route param'dan gelir. */
export const AddPipelineStageSchema = z.object({
  name: z.string().min(1),
  order: z.number().int().nonnegative(),
  type: PipelineStageTypeSchema.optional(),
  color: z.string().min(1).nullable().optional(),
});
