import { createZodDto } from 'nestjs-zod';
import { UpdateActivitySchema } from '../../schemas/commands';

export class UpdateActivityDto extends createZodDto(UpdateActivitySchema) {}
