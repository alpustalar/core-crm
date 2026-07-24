import { createZodDto } from 'nestjs-zod';
import { ReviewLeaveSchema } from '../../schemas/commands';

export class ReviewLeaveDto extends createZodDto(ReviewLeaveSchema) {}
