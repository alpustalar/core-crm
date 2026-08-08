import { QueryResponse } from '@shared/common/response/response.interface';
import { ProjectTask } from '@shared';

export type GetProjectBoardResponse = QueryResponse<ProjectTask[]>;
