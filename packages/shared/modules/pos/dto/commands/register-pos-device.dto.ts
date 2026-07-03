import { createZodDto } from 'nestjs-zod';
import { RegisterPosDeviceSchema } from '../../schemas/commands';

export class RegisterPosDeviceDto extends createZodDto(
  RegisterPosDeviceSchema
) {}
