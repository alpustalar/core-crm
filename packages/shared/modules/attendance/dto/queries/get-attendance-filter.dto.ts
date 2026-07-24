import { createZodDto } from 'nestjs-zod';
import { GetAttendanceFilterSchema } from '../../schemas/queries';

export class GetAttendanceFilterDto extends createZodDto(
  GetAttendanceFilterSchema
) {}
