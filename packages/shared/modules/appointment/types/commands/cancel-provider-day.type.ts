import { z } from 'zod';
import { CancelProviderDaySchema } from '../../schemas/command/cancel-provider-day.schema';

export type CancelProviderDay = z.infer<typeof CancelProviderDaySchema>;
