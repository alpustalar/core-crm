import { createZodDto } from 'nestjs-zod';
import { UpdateTreatmentPackageSchema } from '../../schemas/command';

export class UpdateTreatmentPackageDto extends createZodDto(UpdateTreatmentPackageSchema) {}
