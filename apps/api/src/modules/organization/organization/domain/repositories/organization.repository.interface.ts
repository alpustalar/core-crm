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

export interface IOrganizationQueryRepository {
  findById(id: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  findFirstByOwnerCredentials(ownerId: string): Promise<Organization | null>;
  findOneByIdByOwner(
    ownerId: string,
    organizationId: string
  ): Promise<Organization | null>;
  findIdByClinicId(clinicId: string): Promise<string | null>;
}
