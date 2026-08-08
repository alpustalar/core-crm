import { createZodDto } from 'nestjs-zod';
import { AutoMatchStatementLinesSchema } from '../../schemas/commands';

export class AutoMatchStatementLinesDto extends createZodDto(
  AutoMatchStatementLinesSchema
) {}
