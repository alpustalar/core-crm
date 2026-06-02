import { createZodDto } from 'nestjs-zod';
import { UpdateLeadStatusSchema } from '../../schemas/commands';

export class UpdateLeadStatusDto extends createZodDto(UpdateLeadStatusSchema) {}
