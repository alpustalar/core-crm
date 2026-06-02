import { createZodDto } from 'nestjs-zod';
import { FindTreatmentPackagesSchema } from '../../schemas/queries';

export class FindTreatmentPackagesDto extends createZodDto(FindTreatmentPackagesSchema) {}
