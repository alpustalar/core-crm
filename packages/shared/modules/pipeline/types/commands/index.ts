import { z } from 'zod';
import {
  CreatePipelineSchema,
  AddPipelineStageSchema,
  UpdatePipelineStageSchema,
} from '../../schemas/commands';

export type CreatePipeline = z.infer<typeof CreatePipelineSchema>;
export type AddPipelineStage = z.infer<typeof AddPipelineStageSchema>;
export type UpdatePipelineStage = z.infer<typeof UpdatePipelineStageSchema>;
