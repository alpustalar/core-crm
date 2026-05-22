import { QueryResponse } from '@shared/common/response/response.interface';
import { User } from '@modules/user/domain/entities/user.entity';

export type FindOneWithIdOrEmailQueryResponse = QueryResponse<User>;
