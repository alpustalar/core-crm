import { QueryResponse } from '@shared/common/response/response.interface';
import { User } from '@shared';

export type FindOneWithIdOrEmailQueryResponse = QueryResponse<User>;
