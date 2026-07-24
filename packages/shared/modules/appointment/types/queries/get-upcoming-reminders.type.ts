import { z } from 'zod';
import { GetUpcomingRemindersSchema } from '../../schemas/queries/get-upcoming-reminders.schema';

export type GetUpcomingReminders = z.infer<typeof GetUpcomingRemindersSchema>;
