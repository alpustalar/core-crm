import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CurrencySchema } from '@input-type-schemas/CurrencySchema';
import { GetClinicCurrencyQuery } from './get-clinic-currency.query';
import { GetClinicCurrencyResponse } from './get-clinic-currency.response';
import {
  CLINIC_FINANCE_SETTINGS_QUERY_REPOSITORY,
  IClinicFinanceSettingsQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinic-finance-settings/clinic-finance-settings.query.repository';

@QueryHandler(GetClinicCurrencyQuery)
export class GetClinicCurrencyHandler
  implements IQueryHandler<GetClinicCurrencyQuery, GetClinicCurrencyResponse>
{
  constructor(
    @Inject(CLINIC_FINANCE_SETTINGS_QUERY_REPOSITORY)
    private readonly clinicFinanceSettingsRepo: IClinicFinanceSettingsQueryRepository
  ) {}

  async execute(
    query: GetClinicCurrencyQuery
  ): Promise<GetClinicCurrencyResponse> {
    const settings = await this.clinicFinanceSettingsRepo.findByClinicId(
      query.clinicId
    );
    // Satır henüz yoksa DB default'u geçerli: TRY.
    return {
      data: settings?.defaultCurrency ?? CurrencySchema.enum.TRY,
    };
  }
}
