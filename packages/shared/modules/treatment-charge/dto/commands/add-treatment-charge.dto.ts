import { createZodDto } from 'nestjs-zod';
import { AddTreatmentChargeSchema } from '../../schemas/commands';

export class AddTreatmentChargeDto extends createZodDto(
  AddTreatmentChargeSchema
) {}
