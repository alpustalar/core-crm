import { z } from 'zod';
import { UpdateSupplierSchema } from '../../schemas/commands';

export type UpdateSupplier = z.infer<typeof UpdateSupplierSchema>;
