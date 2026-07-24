import { QueryResponse } from '@shared/common/response/response.interface';
import { AuthUserResponse } from '@modules/identity/user/domain/contracts/user.contracts';

export type FindUserForAuthQueryResponse =
  QueryResponse<AuthUserResponse | null>;
