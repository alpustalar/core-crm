import { IQuery } from '@nestjs/cqrs';
import { GetClinicFinanceSettingsResponse } from './get-clinic-finance-settings.response';

/**
 * Kliniğin finansal davranış ayarları (satellite). İndirim tavanı, varsayılan
 * KDV oranı ve para birimi gibi ticari kuralları okuyan modüller bunu kullanır.
 */
export class GetClinicFinanceSettingsQuery implements IQuery {
  readonly __responseType!: GetClinicFinanceSettingsResponse;

  constructor(public readonly clinicId: string) {}
}
