import { createZodDto } from 'nestjs-zod';
import { CreateActivitySchema } from '../../schemas/commands';

export class CreateActivityDto extends createZodDto(CreateActivitySchema) {}
