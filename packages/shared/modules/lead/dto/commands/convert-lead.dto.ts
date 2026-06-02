import { createZodDto } from 'nestjs-zod';
import { ConvertLeadSchema } from '../../schemas/commands';

export class ConvertLeadDto extends createZodDto(ConvertLeadSchema) {}
