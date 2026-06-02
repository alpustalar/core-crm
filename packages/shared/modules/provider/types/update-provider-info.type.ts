import { z } from 'zod';
import { UpdateProviderInfoSchema } from '../schemas/update-provider-info.schema';

export type UpdateProviderInfo = z.infer<typeof UpdateProviderInfoSchema>;
