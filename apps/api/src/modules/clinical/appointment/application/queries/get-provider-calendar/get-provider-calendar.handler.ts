import { APPOINTMENT_EVENTS } from '@src/domain/constants/events';
/* eslint-disable */
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProviderCalendarQuery } from './get-provider-calendar.query';
import { GetProviderCalendarQueryResponse } from './get-provider-calendar.response';
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
    const { dto, ctx, pagination } = query;
    const { actor } = ctx;

    {
      if (!actor.clinicId) {
        throw new BadRequestException('Actor için klinik tanımlanmamış.');
      }

      this.policyFactory
        .appointment(actor)
        .evaluator.check(
          (p) => p.canScheduleAppointmentInClinic(actor.clinicId),
          'Bu kliniğe ait randevulara erişim yetkiniz yok.'
        )
        .orThrow(APPOINTMENT_EVENTS.PROVIDER_CALENDAR);

      const { items, total } = await this.appointmentRepo.findProviderCalendar({
        pagination,
        providerId: dto.providerId,
        startDate: dto.startDate,
        endDate: dto.endDate,
      });

      return {
        data: items,
        meta: {
          pagination: buildPaginationMeta(pagination, total),
        },
      };
    }
  }
}
