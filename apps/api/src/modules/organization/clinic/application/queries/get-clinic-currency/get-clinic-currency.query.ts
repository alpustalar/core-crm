import { IQuery } from '@nestjs/cqrs';
import { GetClinicCurrencyResponse } from './get-clinic-currency.response';

export class GetClinicCurrencyQuery implements IQuery {
  readonly __responseType!: GetClinicCurrencyResponse;

  constructor(public readonly clinicId: string) {}
}
