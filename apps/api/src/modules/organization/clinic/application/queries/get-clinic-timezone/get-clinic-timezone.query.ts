import { IQuery } from '@nestjs/cqrs';
import { GetClinicTimezoneResponse } from './get-clinic-timezone.response';

export class GetClinicTimezoneQuery implements IQuery {
  readonly __responseType!: GetClinicTimezoneResponse;

  constructor(public readonly clinicId: string) {}
}
