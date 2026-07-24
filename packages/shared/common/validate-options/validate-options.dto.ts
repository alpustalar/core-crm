import { createZodDto } from 'nestjs-zod';
import { ValidateOptionsSchema } from '@shared/common/validate-options/validate-options.schema';

export class ValidateOptionsDto extends createZodDto(
  ValidateOptionsSchema
) {}
