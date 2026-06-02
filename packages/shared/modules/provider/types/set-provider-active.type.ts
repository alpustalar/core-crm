import { z } from 'zod';
import { SetProviderActiveSchema } from '../schemas/set-provider-active.schema';

export type SetProviderActive = z.infer<typeof SetProviderActiveSchema>;
