import { createZodDto } from 'nestjs-zod';
import { FindOrCreatePatientForAuthSchema } from '../../schemas/queries';

export class FindOrCreatePatientForAuthDto extends createZodDto(FindOrCreatePatientForAuthSchema) {}
