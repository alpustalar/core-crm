import { createZodDto } from 'nestjs-zod';
import { RecordFinancialEventSchema } from '@shared/modules/financial-event/schemas/record-financial-event.schema';

export class RecordFinancialEventDto extends createZodDto(
  RecordFinancialEventSchema
) {}
