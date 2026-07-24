import {z} from 'zod'

export const PipelineStageTypeSchema = z.enum(['OPEN', 'WON', 'LOST']);

export const PipelineStageResponseSchema = z.object({
  id: z.string(),
  pipelineId: z.string(),
  name: z.string(),
  order: z.number(),
  type: PipelineStageTypeSchema,
  color: z.string().nullable(),
});

/** Huni aşaması (FE satış panosu kolonu). */
export type PipelineStageResponse = z.infer<typeof PipelineStageResponseSchema>;



/** Huni + aşamaları (FE Kanban). */
export const PipelineResponseSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  clinicId: z.string(),
  name: z.string(),
  isDefault: z.boolean(),
  stages: z.array(PipelineStageResponseSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
})


export type PipelineResponse = z.infer<typeof PipelineResponseSchema>;