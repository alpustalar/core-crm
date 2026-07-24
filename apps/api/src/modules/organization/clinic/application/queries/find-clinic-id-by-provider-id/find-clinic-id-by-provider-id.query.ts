import { IQuery } from '@nestjs/cqrs';
import { FindClinicIdByProviderIdQueryResponse } from './find-clinic-id-by-provider-id.response';

export class FindClinicIdByProviderIdQuery implements IQuery {
  readonly __responseType!: FindClinicIdByProviderIdQueryResponse;

  constructor(public readonly providerId: string) {}
}
