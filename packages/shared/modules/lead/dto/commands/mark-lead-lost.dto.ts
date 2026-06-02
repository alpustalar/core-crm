import { createZodDto } from 'nestjs-zod';
import { MarkLeadLostSchema } from '../../schemas/commands';

export class MarkLeadLostDto extends createZodDto(MarkLeadLostSchema) {}
