import { createZodDto } from 'nestjs-zod';
import { GetPatientsSchema } from '../../schemas/queries';

export class GetPatientsFilterDto extends createZodDto(GetPatientsSchema) {}
