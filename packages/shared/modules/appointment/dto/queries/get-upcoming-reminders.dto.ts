import { createZodDto } from 'nestjs-zod';
import { GetUpcomingRemindersSchema } from '@shared/modules/appointment/schemas/queries/get-upcoming-reminders.schema';

export class GetUpcomingRemindersDto extends createZodDto(
  GetUpcomingRemindersSchema
) {}
