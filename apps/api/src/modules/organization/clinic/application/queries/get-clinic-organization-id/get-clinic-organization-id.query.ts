import { IQuery } from '@nestjs/cqrs';
import { GetClinicOrganizationIdResponse } from './get-clinic-organization-id.response';

export class GetClinicOrganizationIdQuery implements IQuery {
  readonly __responseType!: GetClinicOrganizationIdResponse;

  constructor(public readonly clinicId: string) {}
}
