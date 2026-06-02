import { createZodDto } from 'nestjs-zod';
import { ReceiveStockSchema } from '../../schemas/commands';

export class ReceiveStockDto extends createZodDto(ReceiveStockSchema) {}
