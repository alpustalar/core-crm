import { createZodDto } from 'nestjs-zod';
import { CreateLeadSchema } from '../../schemas/commands';

export class CreateLeadDto extends createZodDto(CreateLeadSchema) {}
