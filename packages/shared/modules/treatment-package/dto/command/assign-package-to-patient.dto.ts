import { createZodDto } from 'nestjs-zod';
import { AssignPackageToPatientSchema } from '../../schemas/command';

export class AssignPackageToPatientDto extends createZodDto(AssignPackageToPatientSchema) {}
