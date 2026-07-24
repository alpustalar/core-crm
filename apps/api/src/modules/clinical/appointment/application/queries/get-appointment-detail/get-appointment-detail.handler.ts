import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAppointmentDetailQuery } from './get-appointment-detail.query';
import { GetAppointmentDetailQueryResponse } from './get-appointment-detail.response';
import { Inject } from '@nestjs/common';
import {
  APPOINTMENT_QUERY_REPOSITORY,
  IAppointmentQueryRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { AppointmentNotFoundException } from '@modules/clinical/appointment/domain/exceptions/appointment.exceptions';

@QueryHandler(GetAppointmentDetailQuery)
export class GetAppointmentDetailHandler
  implements
    IQueryHandler<GetAppointmentDetailQuery, GetAppointmentDetailQueryResponse>
{
  constructor(
    @Inject(APPOINTMENT_QUERY_REPOSITORY)
    private readonly appointmentRepo: IAppointmentQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetAppointmentDetailQuery
  ): Promise<GetAppointmentDetailQueryResponse> {
    const { ctx, appointmentId } = query;

    const appointment =
      await this.appointmentRepo.findByIdWithDetails(appointmentId);

    if (!appointment) throw new AppointmentNotFoundException();

    const serializationOptions = this.policyFactory
      .appointment(ctx.actor, ctx.source)
      .policy.getSerializationOptions({
        clinicId: appointment.clinicId,
        providerId: appointment.providerId,
      });

    return {
      data: appointment,
      meta: { serializationOptions },
    };
  }
}
