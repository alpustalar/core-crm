import { RoleSlug } from '@src/domain/constants/db/role/role-slugs';

export class GetRoleBySlugQuery {
  constructor(public readonly slug: RoleSlug) {}
}
