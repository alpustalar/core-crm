import { createZodDto } from 'nestjs-zod';
import {
  GetMyProjectTasksSchema,
  GetProjectTasksSchema,
  GetProjectsSchema,
  GetResourceScheduleSchema,
} from '../../schemas/queries';

export class GetProjectsFilterDto extends createZodDto(GetProjectsSchema) {}
export class GetProjectTasksFilterDto extends createZodDto(
  GetProjectTasksSchema
) {}
export class GetMyProjectTasksFilterDto extends createZodDto(
  GetMyProjectTasksSchema
) {}
export class GetResourceScheduleFilterDto extends createZodDto(
  GetResourceScheduleSchema
) {}
