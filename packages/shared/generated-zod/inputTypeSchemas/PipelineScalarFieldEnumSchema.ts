import { z } from 'zod';

export const PipelineScalarFieldEnumSchema = z.enum(['id','organizationId','clinicId','name','isDefault','isDeleted','createdAt','updatedAt']);

export default PipelineScalarFieldEnumSchema;
