import { IQuery } from '@nestjs/cqrs';
import { FindOrganizationIdByClinicIdQueryResponse } from './find-organization-id-by-clinic-id.response';

export class FindOrganizationIdByClinicIdQuery implements IQuery {
  readonly __responseType!: FindOrganizationIdByClinicIdQueryResponse;

  constructor(public readonly clinicId: string) {}
}
