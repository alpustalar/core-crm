import { z } from 'zod';
import { decimalSchema } from '../../common/decimal';
import { ProjectPhaseStatusSchema } from '../inputTypeSchemas/ProjectPhaseStatusSchema'

/////////////////////////////////////////
// PROJECT PHASE SCHEMA
/////////////////////////////////////////

export const ProjectPhaseSchema = z.object({
  status: ProjectPhaseStatusSchema,
  id: z.string(),
  projectId: z.string(),
  clinicId: z.string(),
  name: z.string(),
  /**
   * Proje içi sıra (0'dan artan); aynı projede tekil.
   */
  order: z.number().int(),
  startDate: z.coerce.date().nullable(),
  dueDate: z.coerce.date().nullable(),
  completedAt: z.coerce.date().nullable(),
  /**
   * Aşama bütçesi (opsiyonel). Toplamı proje bütçesini aşabilir — engellenmez, raporda gösterilir.
   */
  budget: decimalSchema("Field 'budget' must be a Decimal. Location: ['Models', 'ProjectPhase']").nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ProjectPhase = z.infer<typeof ProjectPhaseSchema>

export default ProjectPhaseSchema;
