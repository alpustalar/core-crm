import { QueryResponse } from '@shared/common/response/response.interface';
import { FindBySlugResponse } from '@modules/identity/role/domain/contracts/role.contracts';

export type GetRoleBySlugQueryResponse =
  QueryResponse<FindBySlugResponse | null>;
