import { createZodDto } from 'nestjs-zod';
import { RecordPayrollAccrualSchema } from '../../schemas/commands';

export class RecordPayrollAccrualDto extends createZodDto(
  RecordPayrollAccrualSchema
) {}
