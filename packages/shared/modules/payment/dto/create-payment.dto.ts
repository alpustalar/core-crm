import { createZodDto } from 'nestjs-zod';
import { CreatePaymentSchema } from '../schemas/create-payment.schema';

export class CreatePaymentDto extends createZodDto(CreatePaymentSchema) {}
