import { createZodDto } from 'nestjs-zod';
import { RecordCashMovementSchema } from '../../schemas/commands';

export class RecordCashMovementDto extends createZodDto(
  RecordCashMovementSchema
) {}
