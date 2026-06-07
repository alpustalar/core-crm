import { Organization } from '@modules/organization/organization/domain/entities/organization.entity';
import { CreateOrganizationProps } from '@modules/organization/organization/domain/types/create-organization.props';
import { UpdateOrganizationProps } from '@modules/organization/organization/domain/types/update-organization.props';
import { IBaseCommandRepository } from '@common/domain/base-command-repository.interface';

export const ORGANIZATION_COMMAND_REPOSITORY = Symbol(
  'IOrganizationCommandRepository'
);
export const ORGANIZATION_QUERY_REPOSITORY = Symbol(
  'IOrganizationQueryRepository'
);

export interface IOrganizationCommandRepository
  extends IBaseCommandRepository<Organization> {
  create(data: CreateOrganizationProps): Promise<Organization>;
  updateByOwner(
    organizationId: string,
    data: UpdateOrganizationProps
  ): Promise<Organization>;
}

export interface IOrganizationQueryRepository {
  findById(id: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  findFirstByOwnerCredentials(ownerId: string): Promise<Organization | null>;
  findOneByIdByOwner(
    ownerId: string,
    organizationId: string
  ): Promise<Organization | null>;
}
