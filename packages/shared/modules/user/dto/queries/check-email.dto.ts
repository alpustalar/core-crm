import { CheckEmailSchema } from '@shared/modules/user/schemas/queries/check-email.schema';
import { createZodDto } from 'nestjs-zod';

export class CheckEmailDto extends createZodDto(CheckEmailSchema) {}
