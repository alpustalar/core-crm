import { createZodDto } from 'nestjs-zod';
import { CreatePatientSchema } from '@shared/modules/patients/schemas/queries/create-patient.schema';

export class CreatePatientDto extends createZodDto(CreatePatientSchema) {}
