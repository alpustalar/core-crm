import { z } from 'zod';
import { decimalSchema } from '../../common/decimal';
import { ProjectTaskStatusSchema } from '../inputTypeSchemas/ProjectTaskStatusSchema'
import { ProjectTaskPrioritySchema } from '../inputTypeSchemas/ProjectTaskPrioritySchema'

/////////////////////////////////////////
// PROJECT TASK SCHEMA
/////////////////////////////////////////

export const ProjectTaskSchema = z.object({
  status: ProjectTaskStatusSchema,
  priority: ProjectTaskPrioritySchema,
  id: z.string(),
  projectId: z.string(),
  phaseId: z.string().nullable(),
  clinicId: z.string(),
  organizationId: z.string(),
  /**
   * Alt görev zinciri (self-relation). Tek seviye beklenir; derinlik zorlanmaz.
   */
  parentTaskId: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  assigneeId: z.string().nullable(),
  createdById: z.string(),
  startDate: z.coerce.date().nullable(),
  dueAt: z.coerce.date().nullable(),
  completedAt: z.coerce.date().nullable(),
  /**
   * Kanban kolonu içi sıra.
   */
  boardOrder: z.number().int(),
  estimatedHours: decimalSchema("Field 'estimatedHours' must be a Decimal. Location: ['Models', 'ProjectTask']").nullable(),
  actualHours: decimalSchema("Field 'actualHours' must be a Decimal. Location: ['Models', 'ProjectTask']").nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ProjectTask = z.infer<typeof ProjectTaskSchema>

export default ProjectTaskSchema;
