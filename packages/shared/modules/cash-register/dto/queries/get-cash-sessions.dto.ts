import { createZodDto } from 'nestjs-zod';
import { GetCashSessionsSchema } from '../../schemas/queries';

export class GetCashSessionsFilterDto extends createZodDto(
  GetCashSessionsSchema
) {}
