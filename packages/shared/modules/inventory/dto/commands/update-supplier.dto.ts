import { createZodDto } from 'nestjs-zod';
import { UpdateSupplierSchema } from '../../schemas/commands';

export class UpdateSupplierDto extends createZodDto(UpdateSupplierSchema) {}
