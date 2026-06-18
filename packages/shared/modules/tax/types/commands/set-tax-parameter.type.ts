import { z } from 'zod';
import { SetTaxParameterSchema } from '../../schemas/commands';

export type SetTaxParameter = z.infer<typeof SetTaxParameterSchema>;
