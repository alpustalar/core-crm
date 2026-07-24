import { createZodDto } from 'nestjs-zod';
import { GetCashRegistersSchema } from '../../schemas/queries';

export class GetCashRegistersFilterDto extends createZodDto(
  GetCashRegistersSchema
) {}
