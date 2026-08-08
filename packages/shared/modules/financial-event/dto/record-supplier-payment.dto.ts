import { createZodDto } from 'nestjs-zod';
import { RecordSupplierPaymentSchema } from '@shared/modules/financial-event/schemas/record-supplier-payment.schema';

export class RecordSupplierPaymentDto extends createZodDto(
  RecordSupplierPaymentSchema
) {}
