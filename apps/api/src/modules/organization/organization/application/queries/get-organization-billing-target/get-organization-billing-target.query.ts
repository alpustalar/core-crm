import { IQuery } from '@nestjs/cqrs';
import { GetOrganizationBillingTargetResponse } from './get-organization-billing-target.response';

export class GetOrganizationBillingTargetQuery implements IQuery {
  readonly __responseType!: GetOrganizationBillingTargetResponse;

  constructor(public readonly organizationId: string) {}
}
