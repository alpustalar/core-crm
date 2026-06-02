import { Organization } from '@modules/organization/domain/entities/organization.entity';
import { CreateOrganizationProps } from '@modules/organization/domain/types/create-organization.props';
import { UpdateOrganizationProps } from '@modules/organization/domain/types/update-organization.props';

export const ORGANIZATION_COMMAND_REPOSITORY = Symbol(
  'IOrganizationCommandRepository'
);
export const ORGANIZATION_QUERY_REPOSITORY = Symbol(
  'IOrganizationQueryRepository'
);

export interface IOrganizationCommandRepository {
  create(data: CreateOrganizationProps): Promise<Organization>;
  updateByOwner(
    organizationId: string,
    data: UpdateOrganizationProps
  ): Promise<Organization>;
  save(entity: Organization): Promise<void>;
  saveMany(entities: Organization[]): Promise<void>;
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
