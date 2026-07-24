import { createZodDto } from 'nestjs-zod';
import { CreateEmployeeSchema } from '../../schemas/commands';

export class CreateEmployeeDto extends createZodDto(CreateEmployeeSchema) {}
