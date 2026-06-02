import { createZodDto } from 'nestjs-zod';
import { FindPatientPackagesSchema } from '../../schemas/queries';

export class FindPatientPackagesDto extends createZodDto(FindPatientPackagesSchema) {}
