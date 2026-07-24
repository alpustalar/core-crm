import { createZodDto } from 'nestjs-zod';
import { ReconcileStatementLineSchema } from '../../schemas/commands';

export class ReconcileStatementLineDto extends createZodDto(
  ReconcileStatementLineSchema
) {}
