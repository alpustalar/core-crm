import { z } from 'zod';
import {
  GetMyProjectTasksSchema,
  GetProjectTasksSchema,
  GetProjectsSchema,
  GetResourceScheduleSchema,
} from '../../schemas/queries';

export type GetProjects = z.infer<typeof GetProjectsSchema>;
export type GetProjectTasks = z.infer<typeof GetProjectTasksSchema>;
export type GetMyProjectTasks = z.infer<typeof GetMyProjectTasksSchema>;
export type GetResourceSchedule = z.infer<typeof GetResourceScheduleSchema>;
