import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetRoleBySlugQuery } from './get-role-by-slug.query';
import { GetRoleBySlugQueryResponse } from './get-role-by-slug.response';
import {
  IRoleQueryRepository,
  ROLE_QUERY_REPOSITORY,
} from '@modules/identity/role/domain/repositories/role/role.query.repository';

@QueryHandler(GetRoleBySlugQuery)
export class GetRoleBySlugHandler
  implements IQueryHandler<GetRoleBySlugQuery, GetRoleBySlugQueryResponse>
{
  constructor(
    @Inject(ROLE_QUERY_REPOSITORY)
    private readonly roleRepository: IRoleQueryRepository
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
