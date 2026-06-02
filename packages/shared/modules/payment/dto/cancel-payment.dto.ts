import { createZodDto } from 'nestjs-zod';
import { CancelPaymentSchema } from '../schemas';

export class CancelPaymentDto extends createZodDto(CancelPaymentSchema) {}
