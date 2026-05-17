import { RoleSlug } from '@src/domain/constants/db/role/role-slugs';
import { GetRoleBySlugResponse } from '@modules/role/application/queries/get-role-by-slug/get-role-by-slug.response';

export const ROLE_REPO_TOKEN = Symbol('IRoleRepository');

export interface IRoleRepository {
  findBySlug(slug: RoleSlug): Promise<GetRoleBySlugResponse>;
}
