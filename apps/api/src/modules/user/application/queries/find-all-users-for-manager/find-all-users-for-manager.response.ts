import { QueryResponse } from '@shared';
import { UserSummary } from '@modules/user/domain/types/user-summary.type';

export type FindAllUsersForManagerQueryResponse = QueryResponse<UserSummary[]>;
