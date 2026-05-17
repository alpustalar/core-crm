import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetRoleBySlugQuery } from './get-role-by-slug.query';
import { GetRoleBySlugResponse } from './get-role-by-slug.response';
import {
  IRoleRepository,
  ROLE_REPO_TOKEN,
} from '@modules/role/domain/repositories/role.repository.interface';

@QueryHandler(GetRoleBySlugQuery)
export class GetRoleBySlugHandler
  implements IQueryHandler<GetRoleBySlugQuery, GetRoleBySlugResponse>
{
  constructor(
    @Inject(ROLE_REPO_TOKEN)
    private readonly roleRepository: IRoleRepository,
  ) {}

  execute(query: GetRoleBySlugQuery): Promise<GetRoleBySlugResponse> {
    return this.roleRepository.findBySlug(query.slug);
  }
}
