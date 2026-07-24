import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetRoleByIdQuery } from './get-role-by-id.query';
import { GetRoleByIdQueryResponse } from './get-role-by-id.response';
import {
  IRoleQueryRepository,
  ROLE_QUERY_REPOSITORY,
} from '@modules/identity/role/domain/repositories/role.repository.interface';

@QueryHandler(GetRoleByIdQuery)
export class GetRoleByIdHandler
  implements IQueryHandler<GetRoleByIdQuery, GetRoleByIdQueryResponse>
{
  constructor(
    @Inject(ROLE_QUERY_REPOSITORY)
    private readonly roleRepository: IRoleQueryRepository
  ) {}

  async execute(query: GetRoleByIdQuery): Promise<GetRoleByIdQueryResponse> {
    const role = await this.roleRepository.findById(query.roleId);
    if (!role) {
      throw new NotFoundException(`Rol bulunamadı: roleId=${query.roleId}`);
    }
    return { data: role.toPersistence() };
  }
}
