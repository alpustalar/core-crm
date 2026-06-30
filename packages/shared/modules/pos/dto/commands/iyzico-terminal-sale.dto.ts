import { createZodDto } from 'nestjs-zod';
import { IyzicoTerminalSaleSchema } from '../../schemas/commands';

export class IyzicoTerminalSaleDto extends createZodDto(
  IyzicoTerminalSaleSchema
) {}
