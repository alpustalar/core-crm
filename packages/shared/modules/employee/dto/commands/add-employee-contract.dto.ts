import { createZodDto } from 'nestjs-zod';
import { AddEmployeeContractSchema } from '../../schemas/commands';

export class AddEmployeeContractDto extends createZodDto(
  AddEmployeeContractSchema
) {}
