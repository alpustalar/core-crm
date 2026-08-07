import { RoleSlug } from '@src/domain/constants/db/role/role-slugs';
import { Role as IRole } from '@shared';
import { FindBySlugResponse } from '@modules/identity/role/domain/role.contracts';

export const ROLE_QUERY_REPOSITORY = Symbol('IRoleRepository');

/** Okuma tarafı: entity değil, plain model döner (veri HTTP sınırını geçiyor). */
export interface IRoleQueryRepository {
  findById(id: string): Promise<IRole | null>;
  findBySlug(slug: RoleSlug): Promise<FindBySlugResponse | null>;
}
