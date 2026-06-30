import { createZodDto } from 'nestjs-zod';
import { IyzicoTerminalRefundSchema } from '../../schemas/commands';

export class IyzicoTerminalRefundDto extends createZodDto(
  IyzicoTerminalRefundSchema
) {}
