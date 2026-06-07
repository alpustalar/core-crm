import { createZodDto } from 'nestjs-zod';
import { CreateAdminRequestSchema } from '../../schemas/commands';

export class CreateAdminRequestDto extends createZodDto(CreateAdminRequestSchema) {}
