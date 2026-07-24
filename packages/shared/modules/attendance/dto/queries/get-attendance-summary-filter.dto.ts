import { createZodDto } from 'nestjs-zod';
import { GetAttendanceSummaryFilterSchema } from '../../schemas/queries';

export class GetAttendanceSummaryFilterDto extends createZodDto(
  GetAttendanceSummaryFilterSchema
) {}
