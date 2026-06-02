import { z } from 'zod';
import { CreateSupplierSchema } from '../../schemas/commands';

export type CreateSupplier = z.infer<typeof CreateSupplierSchema>;
