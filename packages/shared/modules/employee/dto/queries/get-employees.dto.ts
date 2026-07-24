import { createZodDto } from 'nestjs-zod';
import { GetEmployeesSchema } from '../../schemas/queries';

export class GetEmployeesDto extends createZodDto(GetEmployeesSchema) {}
