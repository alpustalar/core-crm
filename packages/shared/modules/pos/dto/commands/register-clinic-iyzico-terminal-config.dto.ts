import { createZodDto } from 'nestjs-zod';
import { RegisterClinicIyzicoTerminalConfigSchema } from '../../schemas/commands';

export class RegisterClinicIyzicoTerminalConfigDto extends createZodDto(
  RegisterClinicIyzicoTerminalConfigSchema
) {}
