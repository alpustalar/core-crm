import { QueryResponse } from '@shared/common/response/response.interface';
import { FindBySlugResponse } from '@modules/identity/role/domain/role.contracts';

export type GetRoleBySlugQueryResponse =
  QueryResponse<FindBySlugResponse | null>;
