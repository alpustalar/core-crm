import { QueryResponse } from '@shared';
import { UserSummary } from '@modules/identity/user/domain/user.contracts';

export type FindAllUsersForManagerQueryResponse = QueryResponse<UserSummary[]>;
