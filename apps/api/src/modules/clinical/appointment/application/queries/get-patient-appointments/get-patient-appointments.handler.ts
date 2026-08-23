import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPatientAppointmentsQuery } from './get-patient-appointments.query';
import { GetPatientAppointmentsQueryResponse } from './get-patient-appointments.response';
import { Inject } from '@nestjs/common';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  IPatientPolicyFactory,
  PATIENT_POLICY_FACTORY,
} from '@modules/platform/policy/patient/domain/interfaces/patient-policy-factory.interface';
import {
  APPOINTMENT_QUERY_REPOSITORY,
  IAppointmentQueryRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment';

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
    private readonly appointmentRepo: IAppointmentQueryRepository,
    @Inject(PATIENT_POLICY_FACTORY)
    private readonly patientPolicyFactory: IPatientPolicyFactory
  ) {}

  async execute(
    query: GetPatientAppointmentsQuery
  ): Promise<GetPatientAppointmentsQueryResponse> {
    const { patientId, pagination, ctx } = query.payload;
    const { items, total } = await this.appointmentRepo.findByPatientId(
      pagination,
      patientId
    );

    const anyPatientAppointment = items[0];

    return {
      data: items,
      meta: {
        pagination: buildPaginationMeta(pagination, total),
        serializationOptions: this.patientPolicyFactory
          .appointment(ctx.actor, ctx.source)
          .policy.getSerializationOptions(anyPatientAppointment),
      },
    };
  }
}
