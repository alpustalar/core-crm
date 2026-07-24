import { createZodDto } from 'nestjs-zod';
import { CloseCashSessionSchema } from '../../schemas/commands';

export class CloseCashSessionDto extends createZodDto(CloseCashSessionSchema) {}
