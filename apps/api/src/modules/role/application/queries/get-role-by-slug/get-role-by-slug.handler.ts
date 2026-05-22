import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetRoleBySlugQuery } from './get-role-by-slug.query';
import { GetRoleBySlugQueryResponse } from './get-role-by-slug.response';
import {
  IRoleRepository,
  ROLE_REPO,
} from '@modules/role/domain/repositories/role.repository.interface';

@QueryHandler(GetRoleBySlugQuery)
export class GetRoleBySlugHandler
  implements IQueryHandler<GetRoleBySlugQuery, GetRoleBySlugQueryResponse>
{
  constructor(
    @Inject(ROLE_REPO)
    private readonly roleRepository: IRoleRepository
  ) {}

  async execute(
    query: GetRoleBySlugQuery
  ): Promise<GetRoleBySlugQueryResponse> {
    const result = await this.roleRepository.findBySlug(query.slug);
    return {
      data: result,
    };
  }
}
