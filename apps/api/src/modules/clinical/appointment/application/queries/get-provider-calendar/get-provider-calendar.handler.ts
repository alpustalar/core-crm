/* eslint-disable */
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProviderCalendarQuery } from './get-provider-calendar.query';
import { GetProviderCalendarQueryResponse } from './get-provider-calendar.response';
import { Inject } from '@nestjs/common';
import {
  APPOINTMENT_QUERY_REPOSITORY,
  IAppointmentQueryRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';

@QueryHandler(GetProviderCalendarQuery)
export class GetProviderCalendarHandler
  implements
    IQueryHandler<GetProviderCalendarQuery, GetProviderCalendarQueryResponse>
{
  constructor(
    @Inject(APPOINTMENT_QUERY_REPOSITORY)
    private readonly appointmentRepo: IAppointmentQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetProviderCalendarQuery
  ): Promise<GetProviderCalendarQueryResponse> {
    const { payload } = query;
    const { filter, ctx, pagination } = payload;

    {
      const { items, total } = await this.appointmentRepo.findProviderCalendar({
        pagination,
        providerId: filter.providerId,
        startDate: filter.startDate,
        endDate: filter.endDate,
      });

      const anyProviderAppointment = items[0];

      const serializationOptions = this.policyFactory
        .appointment(ctx.actor, ctx.source)
        .policy.getSerializationOptions({
          providerId: filter.providerId,
          clinicId: anyProviderAppointment.clinicId,
        });

      return {
        data: items,
        meta: {
          pagination: buildPaginationMeta(pagination, total),
          serializationOptions,
        },
      };
    }
  }
}
