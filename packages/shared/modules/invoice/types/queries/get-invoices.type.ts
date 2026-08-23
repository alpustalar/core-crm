import { z } from 'zod';
import { GetInvoicesSchema } from '../../schemas/queries';

export type GetInvoices = z.infer<typeof GetInvoicesSchema>;
