import { QueryResponse } from '@shared/common/response/response.interface';
import { AuthUserResponse } from '@modules/user/domain/types/auth-user-response.type';

export type FindUserForAuthQueryResponse =
  QueryResponse<AuthUserResponse | null>;
