import { APPOINTMENT_EVENTS } from '@src/domain/constants/events';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAppointmentDetailQuery } from './get-appointment-detail.query';
import { GetAppointmentDetailQueryResponse } from './get-appointment-detail.response';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  APPOINTMENT_QUERY_REPOSITORY,
  IAppointmentQueryRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';

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
    const { actor } = ctx;

    const appointment =
      await this.appointmentRepo.findByIdWithDetails(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Randevu bulunamadı.');
    }

    this.policyFactory
      .appointment(actor)
      .evaluator.check(
        (p) => p.canScheduleAppointmentInClinic(appointment.clinicId),
        'Bu randevuya erişim yetkiniz yok.'
      )
      .orThrow(APPOINTMENT_EVENTS.DETAIL);

    return {
      data: appointment,
    };
  }
}
