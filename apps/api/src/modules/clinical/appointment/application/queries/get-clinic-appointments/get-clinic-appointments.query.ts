import { IGetContext } from '@common/decorators/get-context.decorator';
import { Pagination } from '@shared';
import { IQuery } from '@nestjs/cqrs';
import { GetClinicAppointmentsQueryResponse } from '@modules/clinical/appointment/application/queries/get-clinic-appointments/get-clinic-appointments.response';
import { GetClinicAppointments } from '@shared/modules/appointment/types/queries/get-clinic-appointments.type';

export class GetClinicAppointmentsQuery implements IQuery {
  readonly __responseType!: GetClinicAppointmentsQueryResponse;

  constructor(
    public readonly payload: {
      filter: GetClinicAppointments;
      pagination: Pagination;
      ctx: IGetContext;
    }
  ) {}
}
