import { z } from 'zod';
import { CreateProviderShiftSchema } from '../schemas/create-provider-shift.schema';

export type CreateProviderShift = z.infer<typeof CreateProviderShiftSchema>;
