import { createZodDto } from 'nestjs-zod';
import { MatchPurchaseInvoiceSchema } from '../../schemas/commands';

export class MatchPurchaseInvoiceDto extends createZodDto(
  MatchPurchaseInvoiceSchema
) {}
