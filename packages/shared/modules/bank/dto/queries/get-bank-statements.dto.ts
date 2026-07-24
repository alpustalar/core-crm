import { createZodDto } from 'nestjs-zod';
import { GetBankStatementsSchema } from '../../schemas/queries';

export class GetBankStatementsFilterDto extends createZodDto(
  GetBankStatementsSchema
) {}
