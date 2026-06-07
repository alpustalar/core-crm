import { IGetContext } from '@common/decorators/get-context.decorator';
import { IQuery } from '@nestjs/cqrs';
import { GetAppointmentDetailQueryResponse } from '@modules/clinical/appointment/application/queries/get-appointment-detail/get-appointment-detail.response';

export class GetAppointmentDetailQuery implements IQuery {
  readonly __responseType!: GetAppointmentDetailQueryResponse;
  constructor(
    public readonly appointmentId: string,
    public readonly ctx: IGetContext
  ) {}
}
