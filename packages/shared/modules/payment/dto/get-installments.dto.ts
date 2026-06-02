import { createZodDto } from 'nestjs-zod';
import { GetInstallmentsSchema } from '../schemas';

export class GetInstallmentsDto extends createZodDto(GetInstallmentsSchema) {}
