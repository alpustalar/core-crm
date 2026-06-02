import { createZodDto } from 'nestjs-zod';
import { PaxSaleSchema } from '../../schemas/commands';

export class PaxSaleDto extends createZodDto(PaxSaleSchema) {}
