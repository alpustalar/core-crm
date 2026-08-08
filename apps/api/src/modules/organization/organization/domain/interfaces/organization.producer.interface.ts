export interface OrganizationDeletionJobPayload {
  organizationId: string;
  performedById?: string | null;
}

export interface IOrganizationProducer {
  addOrganizationDeletionJob(
    data: OrganizationDeletionJobPayload
  ): Promise<void>;
}

export const ORGANIZATION_PRODUCER = Symbol('IOrganizationProducer');
