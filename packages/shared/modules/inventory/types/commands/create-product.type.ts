import { z } from 'zod';
import { CreateProductSchema } from '../../schemas/commands';

export type CreateProduct = z.infer<typeof CreateProductSchema>;
