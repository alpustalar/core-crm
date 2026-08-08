import { z } from 'zod';

export const ProjectScalarFieldEnumSchema = z.enum(['id','clinicId','organizationId','code','name','description','status','ownerId','startDate','dueDate','budget','currency','completedAt','cancelledAt','cancelReason','createdById','createdAt','updatedAt']);

export default ProjectScalarFieldEnumSchema;
