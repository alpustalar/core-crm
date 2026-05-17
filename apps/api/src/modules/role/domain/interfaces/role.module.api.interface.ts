import { RoleSlug } from '@src/domain/constants/db/role/role-slugs';
import { GetRoleBySlugResponse } from '@modules/role/application/queries/get-role-by-slug/get-role-by-slug.response';

export const ROLE_MODULE_API_TOKEN = Symbol('IRoleModuleApi');

export interface IRoleModuleApi {
  getBySlug(slug: RoleSlug): Promise<GetRoleBySlugResponse>;
}
