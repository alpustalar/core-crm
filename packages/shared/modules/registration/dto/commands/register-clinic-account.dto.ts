import { createZodDto } from 'nestjs-zod';
import { RegisterClinicAccountSchema } from '../../schemas/commands';

export class RegisterClinicAccountDto extends createZodDto(RegisterClinicAccountSchema) {}
