import { z } from 'zod';

export const ProjectResourceAllocationScalarFieldEnumSchema = z.enum(['id','projectId','phaseId','clinicId','kind','resourceId','startDate','endDate','allocationPercent','note','createdById','createdAt','updatedAt']);

export default ProjectResourceAllocationScalarFieldEnumSchema;
