import { z } from 'zod';

export const PipelineStageTypeSchema = z.enum(['OPEN','WON','LOST']);

export type PipelineStageTypeType = `${z.infer<typeof PipelineStageTypeSchema>}`

export default PipelineStageTypeSchema;
