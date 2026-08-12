import { IQuery } from '@nestjs/cqrs';
import { GetAppointmentChargeSummaryResponse } from './get-appointment-charge-summary.response';

/**
 * Randevunun satır toplamları — fatura ve tahsilatın dayanağı.
 *
 * `ctx` taşımaz: HTTP'ye açık değildir, yalnız finans akışları (fatura kesme,
 * tahsilat oluşturma) içinden çağrılır ve çağıran kiracı kapısını zaten
 * tutmuştur. Kullanıcıya dönen satır/özet için ctx'li `GetAppointmentChargesQuery`
 * kullanılır.
 */
export class GetAppointmentChargeSummaryQuery implements IQuery {
  readonly __responseType!: GetAppointmentChargeSummaryResponse;

  constructor(public readonly appointmentId: string) {}
}
