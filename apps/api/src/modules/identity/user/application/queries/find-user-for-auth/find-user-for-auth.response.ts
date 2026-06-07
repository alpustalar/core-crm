import { QueryResponse } from '@shared/common/response/response.interface';
import { AuthUserResponse } from '@modules/identity/user/domain/types/auth-user-response.type';

export type FindUserForAuthQueryResponse =
  QueryResponse<AuthUserResponse | null>;
