import { RoleSlug } from '@src/domain/constants/db/role/role-slugs';
import { Role } from '@modules/identity/role/domain/entities/role.entity';
import { FindBySlugResponse } from '@modules/identity/role/domain/types/find-by-slug-response.type';

export const ROLE_REPO = Symbol('IRoleRepository');

export interface IRoleRepository {
  findById(id: string): Promise<Role | null>;
  findBySlug(slug: RoleSlug): Promise<FindBySlugResponse | null>;
}
