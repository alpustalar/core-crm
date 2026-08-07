import { QueryResponse } from '@shared/common/response/response.interface';
import { ProjectTask } from '@shared';

export type GetMyProjectTasksResponse = QueryResponse<ProjectTask[]>;
