import { createZodDto } from 'nestjs-zod';
import { ReviewPurchaseRequestSchema } from '../../schemas/commands';

export class ReviewPurchaseRequestDto extends createZodDto(
  ReviewPurchaseRequestSchema
) {}
