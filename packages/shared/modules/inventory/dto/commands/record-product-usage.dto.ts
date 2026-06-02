import { createZodDto } from 'nestjs-zod';
import { RecordProductUsageSchema } from '../../schemas/commands';

export class RecordProductUsageDto extends createZodDto(RecordProductUsageSchema) {}
