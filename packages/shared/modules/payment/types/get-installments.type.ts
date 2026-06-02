import { z } from 'zod';
import { GetInstallmentsSchema } from '../schemas';

export type GetInstallments = z.infer<typeof GetInstallmentsSchema>;
