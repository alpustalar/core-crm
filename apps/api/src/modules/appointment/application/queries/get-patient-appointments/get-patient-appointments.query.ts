import { Pagination } from '@shared';
import { GetPatientAppointmentsQueryResponse } from '@modules/appointment/application/queries/get-patient-appointments/get-patient-appointments.response';
import { IQuery } from '@nestjs/cqrs';

export class GetPatientAppointmentsQuery implements IQuery {
  readonly __responseType!: GetPatientAppointmentsQueryResponse;
  constructor(
    public readonly patientId: string,
    public readonly pagination: Pagination
  ) {}
}
