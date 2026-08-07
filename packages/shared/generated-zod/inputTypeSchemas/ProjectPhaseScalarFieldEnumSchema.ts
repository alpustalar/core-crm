import { z } from 'zod';

export const ProjectPhaseScalarFieldEnumSchema = z.enum(['id','projectId','clinicId','name','order','status','startDate','dueDate','completedAt','budget','createdAt','updatedAt']);

export default ProjectPhaseScalarFieldEnumSchema;
