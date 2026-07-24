import { QueryResponse } from '@shared/common/response/response.interface';
import { Activity } from '@shared';

export type GetMyTasksResponse = QueryResponse<Activity[]>;
