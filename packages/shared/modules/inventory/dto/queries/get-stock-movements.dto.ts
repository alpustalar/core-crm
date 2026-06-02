import { createZodDto } from 'nestjs-zod';
import { GetStockMovementsSchema } from '../../schemas/queries';

export class GetStockMovementsDto extends createZodDto(GetStockMovementsSchema) {}
