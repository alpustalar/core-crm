import { createZodDto } from 'nestjs-zod';
import { AdjustStockSchema } from '../../schemas/commands';

export class AdjustStockDto extends createZodDto(AdjustStockSchema) {}
