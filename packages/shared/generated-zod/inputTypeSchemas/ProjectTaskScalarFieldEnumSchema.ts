import { z } from 'zod';

export const ProjectTaskScalarFieldEnumSchema = z.enum(['id','projectId','phaseId','clinicId','organizationId','parentTaskId','title','description','status','priority','assigneeId','createdById','startDate','dueAt','completedAt','boardOrder','estimatedHours','actualHours','createdAt','updatedAt']);

export default ProjectTaskScalarFieldEnumSchema;
