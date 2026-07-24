import { createZodDto } from 'nestjs-zod';
import { AddPipelineStageSchema } from '../../schemas/commands';

export class AddPipelineStageDto extends createZodDto(AddPipelineStageSchema) {}
