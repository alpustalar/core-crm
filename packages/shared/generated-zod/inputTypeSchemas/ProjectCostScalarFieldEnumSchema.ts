import { z } from 'zod';

export const ProjectCostScalarFieldEnumSchema = z.enum(['id','projectId','phaseId','clinicId','organizationId','source','sourceRefId','description','amount','currency','incurredAt','recordedById','createdAt']);

export default ProjectCostScalarFieldEnumSchema;
