import { z } from 'zod';
import { RecordPurchaseInvoiceSchema } from '../../schemas/commands';

export type RecordPurchaseInvoice = z.infer<typeof RecordPurchaseInvoiceSchema>;
