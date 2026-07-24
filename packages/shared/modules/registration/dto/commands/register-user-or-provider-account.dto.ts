import { createZodDto } from 'nestjs-zod';
import { RegisterUserOrProviderAccountSchema } from '@shared/modules/registration/schemas/commands/register-user-or-provider-account.schema';

export class RegisterUserOrProviderAccountDto extends createZodDto(RegisterUserOrProviderAccountSchema) {}
