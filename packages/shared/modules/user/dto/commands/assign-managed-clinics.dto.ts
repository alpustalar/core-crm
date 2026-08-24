import { createZodDto } from 'nestjs-zod';
import { AssignManagedClinicsSchema } from '../../schemas/commands';

export class AssignManagedClinicsDto extends createZodDto(
  AssignManagedClinicsSchema
) {}
