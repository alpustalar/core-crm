import { CancelProviderDay } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { CancelProviderDayResponse } from './cancel-provider-day.response';

/**
 * Doktor müsait değil (rapor/izin/acil): bir doktorun verilen tarih aralığındaki
 * iptal edilebilir randevularını toplu iptal eder.
 */
export class CancelProviderDayCommand {
  readonly __responseType!: CancelProviderDayResponse;

  constructor(
    public readonly data: CancelProviderDay,
    public readonly ctx: IGetContext
  ) {}
}
