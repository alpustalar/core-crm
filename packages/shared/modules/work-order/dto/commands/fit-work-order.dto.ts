import { createZodDto } from 'nestjs-zod';
import { FitWorkOrderSchema } from '../../schemas/commands';

export class FitWorkOrderDto extends createZodDto(FitWorkOrderSchema) {}
