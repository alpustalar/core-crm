import { createZodDto } from 'nestjs-zod';
import { RecordSupplierPaymentSchema } from '../../schemas/commands';

export class RecordSupplierPaymentDto extends createZodDto(
  RecordSupplierPaymentSchema
) {}
