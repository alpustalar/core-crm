import { GetProviderCalendarSchema } from '@shared/modules';
import { z } from 'zod';

export type GetProviderCalendar = z.infer<typeof GetProviderCalendarSchema>;
