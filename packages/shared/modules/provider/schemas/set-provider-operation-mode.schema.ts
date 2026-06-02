import { z } from 'zod';
import { OperationModeSchema } from './create-provider.schema';

export const SetProviderOperationModeSchema = z.object({
  operationMode: OperationModeSchema,
});
