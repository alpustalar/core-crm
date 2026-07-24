import { z } from 'zod';

export const PipelineStageScalarFieldEnumSchema = z.enum(['id','pipelineId','name','order','type','color','isDeleted','createdAt','updatedAt']);

export default PipelineStageScalarFieldEnumSchema;
