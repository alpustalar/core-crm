import { z } from 'zod';
import { CreateProductCategorySchema } from '../../schemas/commands';

export type CreateProductCategory = z.infer<typeof CreateProductCategorySchema>;
