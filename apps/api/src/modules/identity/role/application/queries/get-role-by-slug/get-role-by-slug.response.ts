import { QueryResponse } from '@shared/common/response/response.interface';

export type GetRoleBySlugQueryResponse = QueryResponse<{
  id: string;
  slug: string;
}>;
