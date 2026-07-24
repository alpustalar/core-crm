import { createZodDto } from 'nestjs-zod';
import { RecordAttendanceSchema } from '../../schemas/commands';

export class RecordAttendanceDto extends createZodDto(
  RecordAttendanceSchema
) {}
