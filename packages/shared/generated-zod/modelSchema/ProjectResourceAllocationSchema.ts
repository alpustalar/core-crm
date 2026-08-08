import { z } from 'zod';
import { ProjectResourceKindSchema } from '../inputTypeSchemas/ProjectResourceKindSchema'

/////////////////////////////////////////
// PROJECT RESOURCE ALLOCATION SCHEMA
/////////////////////////////////////////

export const ProjectResourceAllocationSchema = z.object({
  kind: ProjectResourceKindSchema,
  id: z.string(),
  projectId: z.string(),
  phaseId: z.string().nullable(),
  clinicId: z.string(),
  /**
   * EMPLOYEE → Employee.id, ROOM/EQUIPMENT → Resource.id (scalar; navigation yok).
   */
  resourceId: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  /**
   * Personelin bu projeye ayrılan kapasite yüzdesi (1-100).
   * Oda/cihazda daima 100'dür — mekân bölünmez.
   */
  allocationPercent: z.number().int(),
  note: z.string().nullable(),
  createdById: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ProjectResourceAllocation = z.infer<typeof ProjectResourceAllocationSchema>

export default ProjectResourceAllocationSchema;
