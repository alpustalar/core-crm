import { createZodDto } from 'nestjs-zod';
import { CreateModuleSchema } from '../../schemas/commands';

export class CreateModuleDto extends createZodDto(CreateModuleSchema) {}
