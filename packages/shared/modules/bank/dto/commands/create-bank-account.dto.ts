import { createZodDto } from 'nestjs-zod';
import { CreateBankAccountSchema } from '../../schemas/commands';

export class CreateBankAccountDto extends createZodDto(
  CreateBankAccountSchema
) {}
