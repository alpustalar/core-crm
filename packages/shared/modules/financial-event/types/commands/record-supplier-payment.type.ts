import { z } from 'zod';
import { RecordSupplierPaymentSchema } from '../../schemas/commands';

export type RecordSupplierPayment = z.infer<typeof RecordSupplierPaymentSchema>;
