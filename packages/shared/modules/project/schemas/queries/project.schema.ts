import { z } from 'zod';
import ProjectStatusSchema from '@shared/generated-zod/inputTypeSchemas/ProjectStatusSchema';
import ProjectTaskStatusSchema from '@shared/generated-zod/inputTypeSchemas/ProjectTaskStatusSchema';
import ProjectResourceKindSchema from '@shared/generated-zod/inputTypeSchemas/ProjectResourceKindSchema';

export const GetProjectsSchema = z.object({
  status: ProjectStatusSchema.optional(),
  ownerId: z.uuid().optional(),
  search: z.string().max(200).optional(),
});

export const GetProjectTasksSchema = z.object({
  status: ProjectTaskStatusSchema.optional(),
  assigneeId: z.uuid().optional(),
  phaseId: z.uuid().optional(),
});

export const GetMyProjectTasksSchema = z.object({
  status: ProjectTaskStatusSchema.optional(),
});

export const GetResourceScheduleSchema = z.object({
  kind: ProjectResourceKindSchema.optional(),
  resourceId: z.uuid().optional(),
  from: z.coerce.date(),
  to: z.coerce.date(),
});
