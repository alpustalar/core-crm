import { createZodDto } from 'nestjs-zod';
import { RefundPaymentSchema } from '../schemas';

export class RefundPaymentDto extends createZodDto(RefundPaymentSchema) {}
