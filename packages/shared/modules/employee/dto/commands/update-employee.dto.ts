import { createZodDto } from 'nestjs-zod';
import { UpdateEmployeeSchema } from '../../schemas/commands';

export class UpdateEmployeeDto extends createZodDto(UpdateEmployeeSchema) {}
