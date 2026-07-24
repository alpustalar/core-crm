import { createZodDto } from 'nestjs-zod';
import { CreatePipelineSchema } from '../../schemas/commands';

export class CreatePipelineDto extends createZodDto(CreatePipelineSchema) {}
