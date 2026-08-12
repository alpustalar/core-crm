import { IQuery } from '@nestjs/cqrs';
import { GetInvoiceByAppointmentIdResponse } from './get-invoice-by-appointment-id.response';

/**
 * Randevunun faturası. İşlem satırlarını dondurmak (faturası kesilmiş randevunun
 * satırı değiştirilemez) için modüller arası bu sorgu üzerinden okunur.
 */
export class GetInvoiceByAppointmentIdQuery implements IQuery {
  readonly __responseType!: GetInvoiceByAppointmentIdResponse;

  constructor(public readonly appointmentId: string) {}
}
