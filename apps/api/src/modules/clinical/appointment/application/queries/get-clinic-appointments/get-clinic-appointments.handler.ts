import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClinicAppointmentsQuery } from './get-clinic-appointments.query';
import { GetClinicAppointmentsQueryResponse } from './get-clinic-appointments.response';
import { Inject } from '@nestjs/common';

import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  APPOINTMENT_QUERY_REPOSITORY,
  IAppointmentQueryRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment';

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
    const { ctx, filter, pagination } = query.payload;

    const { items, total } = await this.appointmentRepo.findClinicCalendar({
      clinicId: filter.clinicId,
      startDate: filter.startDate,
      endDate: filter.endDate,
      pagination: pagination,
      providerId: filter.providerId,
      status: filter.status,
    });

    return {
      data: items,
      meta: {
        pagination: buildPaginationMeta(pagination, total),
        serializationOptions: this.policyFactory
          .appointment(ctx.actor, ctx.source)
          .policy.getSerializationOptions({
            clinicId: filter.clinicId,
            providerId: filter.providerId,
          }),
      },
    };
  }
}
