import { createZodDto } from 'nestjs-zod';
import { RecordFinancialEventSchema } from '../../schemas/commands';

export class RecordFinancialEventDto extends createZodDto(
  RecordFinancialEventSchema
) {}
