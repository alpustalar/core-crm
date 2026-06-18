import { IQuery } from '@nestjs/cqrs';
import { GetPaymentByAppointmentIdResponse } from './get-payment-by-appointment-id.response';

/** Bir randevuya ait ödemeyi (taksitleriyle) döner; yoksa null. */
export class GetPaymentByAppointmentIdQuery implements IQuery {
  readonly __responseType!: GetPaymentByAppointmentIdResponse;
  constructor(public readonly appointmentId: string) {}
}
