import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClinicAppointmentsQuery } from './get-clinic-appointments.query';
import { GetClinicAppointmentsQueryResponse } from './get-clinic-appointments.response';
import { BadRequestException, Inject } from '@nestjs/common';
import {
  APPOINTMENT_QUERY_REPOSITORY,
  IAppointmentQueryRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';

@QueryHandler(GetClinicAppointmentsQuery)
export class GetClinicAppointmentsHandler
  implements
    IQueryHandler<
      GetClinicAppointmentsQuery,
      GetClinicAppointmentsQueryResponse
    >
{
  constructor(
    @Inject(APPOINTMENT_QUERY_REPOSITORY)
    private readonly appointmentRepo: IAppointmentQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetClinicAppointmentsQuery
  ): Promise<GetClinicAppointmentsQueryResponse> {
    const { ctx, pagination, dto } = query;
    const { actor } = ctx;

    if (!actor.clinicId) {
      throw new BadRequestException('Actor için klinik tanımlanmamış.');
    }

    this.policyFactory
      .appointment(actor)
      .evaluator.check(
        (p) => p.canScheduleAppointmentInClinic(actor.clinicId),
        'Bu kliniğe ait randevulara erişim yetkiniz yok.'
      )
      .orThrow();

    const paginatedAppointments = await this.appointmentRepo.findClinicCalendar(
      {
        clinicId: actor.clinicId,
        startDate: dto.startDate,
        endDate: dto.endDate,
        pagination: pagination,
      }
    );

    return {
      data: paginatedAppointments.items,
      meta: {
        pagination: buildPaginationMeta(
          pagination,
          paginatedAppointments.total
        ),
      },
    };
  }
}
