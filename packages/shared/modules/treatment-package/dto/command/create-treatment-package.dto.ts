import { createZodDto } from 'nestjs-zod';
import { CreateTreatmentPackageSchema } from '../../schemas/command';

export class CreateTreatmentPackageDto extends createZodDto(CreateTreatmentPackageSchema) {}
