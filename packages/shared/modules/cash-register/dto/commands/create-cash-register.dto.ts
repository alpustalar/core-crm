import { createZodDto } from 'nestjs-zod';
import { CreateCashRegisterSchema } from '../../schemas/commands';

export class CreateCashRegisterDto extends createZodDto(
  CreateCashRegisterSchema
) {}
