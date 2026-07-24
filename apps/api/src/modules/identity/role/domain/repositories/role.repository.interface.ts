import { RoleSlug } from '@src/domain/constants/db/role/role-slugs';
import { Role } from '@modules/identity/role/domain/entities/role.entity';
import { FindBySlugResponse } from '@modules/identity/role/domain/role.contracts';

export const ROLE_QUERY_REPOSITORY = Symbol('IRoleRepository');

export interface IRoleQueryRepository {
  findById(id: string): Promise<Role | null>;
  findBySlug(slug: RoleSlug): Promise<FindBySlugResponse | null>;
}
