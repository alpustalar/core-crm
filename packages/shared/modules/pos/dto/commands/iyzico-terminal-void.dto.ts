import { createZodDto } from 'nestjs-zod';
import { IyzicoTerminalVoidSchema } from '../../schemas/commands';

export class IyzicoTerminalVoidDto extends createZodDto(
  IyzicoTerminalVoidSchema
) {}
