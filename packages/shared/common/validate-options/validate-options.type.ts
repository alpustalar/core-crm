import { ValidateOptionsSchema } from '@shared/common/validate-options/validate-options.schema';
import { z } from 'zod';

export type ValidateOptionsType = z.infer<typeof ValidateOptionsSchema>;
