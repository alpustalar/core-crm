import { createZodDto } from 'nestjs-zod';
import { PatientVerifySchema } from '../../schemas/commands';

export class PatientVerifyDto extends createZodDto(PatientVerifySchema) {}
