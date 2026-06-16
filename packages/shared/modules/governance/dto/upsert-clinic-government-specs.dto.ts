import { createZodDto } from 'nestjs-zod';
import { UpsertClinicGovernmentSpecsSchema } from '../schemas/upsert-clinic-government-specs.schema';

export class UpsertClinicGovernmentSpecsDto extends createZodDto(
  UpsertClinicGovernmentSpecsSchema
) {}
