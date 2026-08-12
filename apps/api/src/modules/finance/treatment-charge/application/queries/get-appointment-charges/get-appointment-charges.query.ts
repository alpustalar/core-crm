import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { GetAppointmentCharges } from '@shared/modules/treatment-charge/types/queries';
import { GetAppointmentChargesResponse } from './get-appointment-charges.response';

export class GetAppointmentChargesQuery implements IQuery {
  readonly __responseType!: GetAppointmentChargesResponse;

  constructor(
    public readonly payload: {
      readonly appointmentId: string;
      readonly filter: GetAppointmentCharges;
      readonly ctx: IGetContext;
    }
  ) {}
}
