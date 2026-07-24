import { createZodDto } from 'nestjs-zod';
import { CancelProviderDaySchema } from '@shared/modules/appointment/schemas/command/cancel-provider-day.schema';

export class CancelProviderDayDto extends createZodDto(
  CancelProviderDaySchema
) {}
