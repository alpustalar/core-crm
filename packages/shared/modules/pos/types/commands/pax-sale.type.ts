import { z } from 'zod';
import { PaxSaleSchema } from '../../schemas/commands';

export type PaxSale = z.infer<typeof PaxSaleSchema>;
