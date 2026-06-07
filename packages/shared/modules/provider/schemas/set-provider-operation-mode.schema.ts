import { z } from 'zod';
import { OperationModeSchema } from '../../../generated-zod/inputTypeSchemas/OperationModeSchema';

export const SetProviderOperationModeSchema = z.object({
  operationMode: OperationModeSchema,
});
