import { QueryResponse } from '@shared/common/response/response.interface';
import { Role } from '@modules/role/domain/entities/role.entity';

export type GetRoleByIdQueryResponse = QueryResponse<Role>;
