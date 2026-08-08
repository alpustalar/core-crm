import { Organization as IOrganization } from '@shared';

export const ORGANIZATION_QUERY_REPOSITORY = Symbol(
  'IOrganizationQueryRepository'
);

export interface IOrganizationQueryRepository {
  findFirstByOwnerCredentials(ownerId: string): Promise<IOrganization | null>;
  findOneByIdByOwner(
    ownerId: string,
    organizationId: string
  ): Promise<IOrganization | null>;
  findIdByClinicId(clinicId: string): Promise<string | null>;
  findBySlug(slug: string): Promise<IOrganization | null>;
  findById(id: string): Promise<IOrganization | null>;
}
