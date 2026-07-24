import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetClinicCalendarResponse } from './get-clinic-calendar.response';
import { GetClinicCalendar } from '@shared';

/**
 * Bir kliniğin verilen tarih aralığındaki TAM takvimini (tüm randevular, sayfasız)
 * sorgular. providerId verilirse tek doktora daralır; verilmezse kliniğin tüm
 * doktorları. Müsaitlik/boşluk hesaplanmaz — dolu-boş fark etmeksizin tüm randevular.
 */
export class GetClinicCalendarQuery implements IQuery {
  readonly __responseType!: GetClinicCalendarResponse;

  constructor(
    public readonly data: GetClinicCalendar,
    public readonly ctx: IGetContext
  ) {}
}
