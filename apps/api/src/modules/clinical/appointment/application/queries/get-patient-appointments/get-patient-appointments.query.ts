import { Pagination } from '@shared';
import { GetPatientAppointmentsQueryResponse } from '@modules/clinical/appointment/application/queries/get-patient-appointments/get-patient-appointments.response';
import { IQuery } from '@nestjs/cqrs';
import { IGetPatientContext } from '@common/decorators/get-patient-context.decorator';

export class GetPatientAppointmentsQuery implements IQuery {
  readonly __responseType!: GetPatientAppointmentsQueryResponse;
  constructor(
    public readonly payload: {
      readonly patientId: string;
      readonly pagination: Pagination;
      readonly ctx: IGetPatientContext;
    }
  ) {}
}
