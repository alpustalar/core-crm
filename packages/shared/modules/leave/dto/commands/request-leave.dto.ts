import { createZodDto } from 'nestjs-zod';
import { RequestLeaveSchema } from '../../schemas/commands';

export class RequestLeaveDto extends createZodDto(RequestLeaveSchema) {}
