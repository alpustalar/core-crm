import { QueryResponse } from '@shared/common/response/response.interface';
import { FindBySlugResponse } from '@modules/identity/role/domain/types/find-by-slug-response.type';

export type GetRoleBySlugQueryResponse =
  QueryResponse<FindBySlugResponse | null>;
