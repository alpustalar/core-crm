import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { IRoleModuleApi } from '@modules/role/domain/interfaces/role.module.api.interface';
import { RoleSlug } from '@src/domain/constants/db/role/role-slugs';
import { GetRoleBySlugQuery } from '@modules/role/application/queries/get-role-by-slug/get-role-by-slug.query';
import { GetRoleBySlugResponse } from '@modules/role/application/queries/get-role-by-slug/get-role-by-slug.response';

@Injectable()
export class RoleModuleApi implements IRoleModuleApi {
  constructor(private readonly queryBus: QueryBus) {}

  getBySlug(slug: RoleSlug): Promise<GetRoleBySlugResponse> {
    return this.queryBus.execute(new GetRoleBySlugQuery(slug));
  }
}
