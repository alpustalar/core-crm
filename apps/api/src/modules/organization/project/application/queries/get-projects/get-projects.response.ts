import { QueryResponse } from '@shared/common/response/response.interface';
import { Project } from '@shared';

export type GetProjectsResponse = QueryResponse<Project[]>;
