import { createZodDto } from 'nestjs-zod';
import { IyzicoTerminalEodSchema } from '../../schemas/commands';

export class IyzicoTerminalEodDto extends createZodDto(
  IyzicoTerminalEodSchema
) {}
