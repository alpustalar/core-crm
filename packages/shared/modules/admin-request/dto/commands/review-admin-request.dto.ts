import { createZodDto } from 'nestjs-zod';
import { ReviewAdminRequestSchema } from '../../schemas/commands';

export class ReviewAdminRequestDto extends createZodDto(ReviewAdminRequestSchema) {}
