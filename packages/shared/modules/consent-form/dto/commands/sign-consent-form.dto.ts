import { createZodDto } from 'nestjs-zod';
import { SignConsentFormSchema } from '../../schemas/commands';

export class SignConsentFormDto extends createZodDto(SignConsentFormSchema) {}
