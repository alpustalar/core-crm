import { createZodDto } from 'nestjs-zod';
import { RecordPurchaseInvoiceSchema } from '../../schemas/commands';

export class RecordPurchaseInvoiceDto extends createZodDto(
  RecordPurchaseInvoiceSchema
) {}
