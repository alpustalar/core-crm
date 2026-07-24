import { createZodDto } from 'nestjs-zod';
import { ImportBankStatementSchema } from '../../schemas/commands';

export class ImportBankStatementDto extends createZodDto(
  ImportBankStatementSchema
) {}
