import { createZodDto } from 'nestjs-zod';
import { PaxVoidSchema } from '../../schemas/commands';

export class PaxVoidDto extends createZodDto(PaxVoidSchema) {}
