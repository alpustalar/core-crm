import { z } from 'zod';
import { SetProviderOperationModeSchema } from '../schemas/set-provider-operation-mode.schema';

export type SetProviderOperationMode = z.infer<typeof SetProviderOperationModeSchema>;
