import { z } from 'zod';
import { PaxVoidSchema } from '../../schemas/commands';

export type PaxVoid = z.infer<typeof PaxVoidSchema>;
