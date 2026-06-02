import { z } from 'zod';
import { FindSuppliersSchema } from '../../schemas/queries';

export type FindSuppliers = z.infer<typeof FindSuppliersSchema>;
