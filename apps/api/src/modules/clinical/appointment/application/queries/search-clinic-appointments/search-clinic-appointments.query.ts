import { SearchClinicAppointments } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { IQuery } from '@nestjs/cqrs';
import { SearchClinicAppointmentsQueryResponse } from './search-clinic-appointments.response';

/**
 * Resepsiyon randevu araması: aktörün kliniğinde ad/telefon + opsiyonel
 * status/doktor/tarih filtresiyle sayfalı arama. clinicId gövdeden DEĞİL,
 * aktör bağlamından alınır.
 */
export class SearchClinicAppointmentsQuery implements IQuery {
  readonly __responseType!: SearchClinicAppointmentsQueryResponse;

  constructor(
    public readonly filter: SearchClinicAppointments,
    public readonly ctx: IGetContext
  ) {}
}
