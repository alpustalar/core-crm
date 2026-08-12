import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClinicFinanceSettingsQuery } from './get-clinic-finance-settings.query';
import { GetClinicFinanceSettingsResponse } from './get-clinic-finance-settings.response';
import {
  CLINIC_FINANCE_SETTINGS_QUERY_REPOSITORY,
  IClinicFinanceSettingsQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinic-finance-settings/clinic-finance-settings.query.repository';

/**
 * Ayar satırı yoksa `null` döner; çağıran DB default'larını (indirim tavanı 0,
 * KDV %20) uygular. Sessizce varsayılan üretmek yerine yokluğu bildirmek,
 * çağıranın "hiç ayarlanmamış" durumunu ayırt etmesini sağlar.
 */
@QueryHandler(GetClinicFinanceSettingsQuery)
export class GetClinicFinanceSettingsHandler
  implements
    IQueryHandler<GetClinicFinanceSettingsQuery, GetClinicFinanceSettingsResponse>
{
  constructor(
    @Inject(CLINIC_FINANCE_SETTINGS_QUERY_REPOSITORY)
    private readonly settingsRepo: IClinicFinanceSettingsQueryRepository
  ) {}

  async execute(
    query: GetClinicFinanceSettingsQuery
  ): Promise<GetClinicFinanceSettingsResponse> {
    return { data: await this.settingsRepo.findByClinicId(query.clinicId) };
  }
}
