import { z } from 'zod';

/** Kanban panosunda lead'i hedef aşamaya taşır. `reason` yalnız LOST aşamasında anlamlı. */
export const MoveLeadToStageSchema = z.object({
  stageId: z.string().uuid(),
  reason: z.string().optional(),
});
