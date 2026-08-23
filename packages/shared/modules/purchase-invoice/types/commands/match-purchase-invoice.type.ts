import { z } from 'zod';
import { MatchPurchaseInvoiceSchema } from '../../schemas/commands';

export type MatchPurchaseInvoice = z.infer<typeof MatchPurchaseInvoiceSchema>;
