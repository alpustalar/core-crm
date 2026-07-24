import { GetProviderCalendarSchema } from '@shared/modules';
import { createZodDto } from 'nestjs-zod';

export class GetProviderCalendarDto extends createZodDto(
  GetProviderCalendarSchema
) {
  
}
