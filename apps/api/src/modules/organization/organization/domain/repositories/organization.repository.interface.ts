import { Organization as IOrganization } from '@shared';
import { Organization } from '@modules/organization/organization/domain/entities/organization.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const ORGANIZATION_COMMAND_REPOSITORY = Symbol(
  'IOrganizationCommandRepository'
);
export const ORGANIZATION_QUERY_REPOSITORY = Symbol(
  'IOrganizationQueryRepository'
);

export type IOrganizationCommandRepository =
  IBaseCommandRepository<Organization>;

/**
 * Okuma tarafı: entity değil, plain model döner.
 * NOT: `findById` / `findBySlug` hiçbir yerden çağrılmıyordu — kaldırıldı.
 */
export interface IOrganizationQueryRepository {
  findFirstByOwnerCredentials(ownerId: string): Promise<IOrganization | null>;
  findOneByIdByOwner(
    ownerId: string,
    organizationId: string
  ): Promise<IOrganization | null>;
  findIdByClinicId(clinicId: string): Promise<string | null>;
}
