import { createZodDto } from 'nestjs-zod';
import { OpenCashSessionSchema } from '../../schemas/commands';

export class OpenCashSessionDto extends createZodDto(OpenCashSessionSchema) {}
