import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetRoleByIdQuery } from './get-role-by-id.query';
import { GetRoleByIdQueryResponse } from './get-role-by-id.response';
import {
  IRoleRepository,
  ROLE_REPO,
} from '@modules/role/domain/repositories/role.repository.interface';

@QueryHandler(GetRoleByIdQuery)
export class GetRoleByIdHandler
  implements IQueryHandler<GetRoleByIdQuery, GetRoleByIdQueryResponse>
{
  constructor(
    @Inject(ROLE_REPO)
    private readonly roleRepository: IRoleRepository
  ) {}

  async execute(query: GetRoleByIdQuery): Promise<GetRoleByIdQueryResponse> {
    const role = await this.roleRepository.findById(query.roleId);
    if (!role) {
      throw new NotFoundException(`Rol bulunamadı: roleId=${query.roleId}`);
    }
    return { data: role };
  }
}
