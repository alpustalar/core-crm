import { createZodDto } from 'nestjs-zod';
import { UpdateModuleSchema } from '../../schemas/commands';

export class UpdateModuleDto extends createZodDto(UpdateModuleSchema) {}
