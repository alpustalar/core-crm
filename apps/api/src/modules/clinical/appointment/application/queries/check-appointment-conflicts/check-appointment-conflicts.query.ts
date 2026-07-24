import { CheckAppointmentConflicts } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { IQuery } from '@nestjs/cqrs';
import { CheckAppointmentConflictsResponse } from './check-appointment-conflicts.response';

interface CheckAppointmentConflictsPayload {
  filter: CheckAppointmentConflicts;
  ctx: IGetContext;
}

/**
 * Çakışma görünürlüğü: verilen doktor + zaman aralığıyla çakışan mevcut randevuları
 * listeler. ENGELLEMEZ — personel çakışmayı görüp yine de randevu ekleyebilir. Booking/
 * reschedule ekranı bu sorguyu çağırıp uyarı gösterir.
 */
export class CheckAppointmentConflictsQuery implements IQuery {
  readonly __responseType!: CheckAppointmentConflictsResponse;

  constructor(public readonly payload: CheckAppointmentConflictsPayload) {}
}
