import { createZodDto } from 'nestjs-zod';
import { GetBankAccountsSchema } from '../../schemas/queries';

export class GetBankAccountsFilterDto extends createZodDto(
  GetBankAccountsSchema
) {}
