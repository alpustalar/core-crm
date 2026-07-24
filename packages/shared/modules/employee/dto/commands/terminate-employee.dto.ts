import { createZodDto } from 'nestjs-zod';
import { TerminateEmployeeSchema } from '../../schemas/commands';

export class TerminateEmployeeDto extends createZodDto(
  TerminateEmployeeSchema
) {}
