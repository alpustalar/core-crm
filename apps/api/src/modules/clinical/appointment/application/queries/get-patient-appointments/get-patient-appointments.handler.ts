import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPatientAppointmentsQuery } from './get-patient-appointments.query';
import { GetPatientAppointmentsQueryResponse } from './get-patient-appointments.response';
import { Inject } from '@nestjs/common';
import {
  APPOINTMENT_QUERY_REPOSITORY,
  IAppointmentQueryRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';

@QueryHandler(GetPatientAppointmentsQuery)
export class GetPatientAppointmentsHandler
  implements
    IQueryHandler<
      GetPatientAppointmentsQuery,
      GetPatientAppointmentsQueryResponse
    >
{
  constructor(
    @Inject(APPOINTMENT_QUERY_REPOSITORY)
    private readonly appointmentRepo: IAppointmentQueryRepository
  ) {}

  async execute(
    query: GetPatientAppointmentsQuery
  ): Promise<GetPatientAppointmentsQueryResponse> {
    const { patientId, pagination } = query;
    const { items, total } = await this.appointmentRepo.findByPatientId(
      pagination,
      patientId
    );

    return {
      data: items.map((item) => item.toPersistence()),
      meta: {
        pagination: buildPaginationMeta(pagination, total),
      },
    };
  }
}
