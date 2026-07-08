import { z } from 'zod';

/////////////////////////////////////////
// PLAN MODULE SCHEMA
/////////////////////////////////////////

/**
 * Plan ↔ Module bundle (many-to-many) — bir plana dahil modüller.
 */
export const PlanModuleSchema = z.object({
  id: z.string(),
  planRowId: z.string(),
  moduleId: z.string(),
})

export type PlanModule = z.infer<typeof PlanModuleSchema>

export default PlanModuleSchema;
