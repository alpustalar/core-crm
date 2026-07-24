import { Pagination } from '@shared';
import { GetPatientAppointmentsQueryResponse } from '@modules/clinical/appointment/application/queries/get-patient-appointments/get-patient-appointments.response';
import { IQuery } from '@nestjs/cqrs';
import { IGetPatientContext } from '@common/decorators';

export class GetPatientAppointmentsQuery implements IQuery {
  readonly __responseType!: GetPatientAppointmentsQueryResponse;
  constructor(
    public readonly payload: {
      patientId: string;
      pagination: Pagination;
      ctx: IGetPatientContext;
    }
  ) {}
}
