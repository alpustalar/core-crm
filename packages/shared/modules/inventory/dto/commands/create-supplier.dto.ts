import { createZodDto } from 'nestjs-zod';
import { CreateSupplierSchema } from '../../schemas/commands';

export class CreateSupplierDto extends createZodDto(CreateSupplierSchema) {}
