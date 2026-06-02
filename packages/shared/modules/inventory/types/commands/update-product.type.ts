import { z } from 'zod';
import { UpdateProductSchema } from '../../schemas/commands';

export type UpdateProduct = z.infer<typeof UpdateProductSchema>;
