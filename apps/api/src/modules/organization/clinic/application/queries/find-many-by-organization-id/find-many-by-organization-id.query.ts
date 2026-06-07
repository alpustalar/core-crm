import { IQuery } from '@nestjs/cqrs';
import { FindManyByOrganizationIdQueryResponse } from '@modules/organization/clinic/application/queries/find-many-by-organization-id/find-many-by-organization-id.response';

export class FindManyByOrganizationIdQuery implements IQuery {
  readonly __responseType!: FindManyByOrganizationIdQueryResponse;
  constructor(public readonly organizationId: string) {}
}
