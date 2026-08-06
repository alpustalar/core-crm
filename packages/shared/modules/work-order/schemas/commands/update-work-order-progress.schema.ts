import { z } from 'zod';

/**
 * Tedarikçideki ara ilerleme adımları. Hangi geçişin geçerli olduğunu entity
 * doğrular (ör. READY'den TRY_IN'e dönülemez).
 */
export const WorkOrderProgressStageSchema = z.enum([
  'IN_PROGRESS',
  'TRY_IN',
  'READY',
]);
export type WorkOrderProgressStage = z.infer<
  typeof WorkOrderProgressStageSchema
>;

export const UpdateWorkOrderProgressSchema = z.object({
  stage: WorkOrderProgressStageSchema,
});
