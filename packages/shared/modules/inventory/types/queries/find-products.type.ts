import { z } from 'zod';
import { FindProductsSchema } from '../../schemas/queries';

export type FindProducts = z.infer<typeof FindProductsSchema>;
