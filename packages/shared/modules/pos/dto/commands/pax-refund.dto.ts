import { createZodDto } from 'nestjs-zod';
import { PaxRefundSchema } from '../../schemas/commands';

export class PaxRefundDto extends createZodDto(PaxRefundSchema) {}
