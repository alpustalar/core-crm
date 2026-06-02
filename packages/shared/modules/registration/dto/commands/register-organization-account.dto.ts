import { createZodDto } from 'nestjs-zod';
import { RegisterOrganizationAccountSchema } from '../../schemas/commands';

export class RegisterOrganizationAccountDto extends createZodDto(RegisterOrganizationAccountSchema) {}
