import { RoleSlug } from '@src/domain/constants/db/role/role-slugs';
import { IQuery } from '@nestjs/cqrs';
import { GetRoleBySlugQueryResponse } from '@modules/identity/role/application/queries/get-role-by-slug/get-role-by-slug.response';

export class GetRoleBySlugQuery implements IQuery {
  readonly __responseType!: GetRoleBySlugQueryResponse;
  constructor(public readonly slug: RoleSlug) {}
}
