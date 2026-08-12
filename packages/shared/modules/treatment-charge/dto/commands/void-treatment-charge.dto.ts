import { createZodDto } from 'nestjs-zod';
import { VoidTreatmentChargeSchema } from '../../schemas/commands';

export class VoidTreatmentChargeDto extends createZodDto(
  VoidTreatmentChargeSchema
) {}
