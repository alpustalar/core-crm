import { createZodDto } from 'nestjs-zod';
import { UpdatePipelineStageSchema } from '../../schemas/commands';

export class UpdatePipelineStageDto extends createZodDto(
  UpdatePipelineStageSchema
) {}
