import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUpcomingRemindersQuery } from './get-upcoming-reminders.query';
import { GetUpcomingRemindersQueryResponse } from './get-upcoming-reminders.response';

import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  APPOINTMENT_QUERY_REPOSITORY,
  IAppointmentQueryRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

/**
 * Resepsiyon hatırlatma listesi. Aktörün kliniğine sabitlenir; repo, hoursAhead
 * içindeki onaylı yaklaşan randevuları sayfalı döner (repo düz kayıt verir).
 */
@QueryHandler(GetUpcomingRemindersQuery)
export class GetUpcomingRemindersHandler implements IQueryHandler<
  GetUpcomingRemindersQuery,
  GetUpcomingRemindersQueryResponse
> {
  constructor(
    @Inject(APPOINTMENT_QUERY_REPOSITORY)
    private readonly appointmentRepo: IAppointmentQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetUpcomingRemindersQuery
  ): Promise<GetUpcomingRemindersQueryResponse> {
    const { filter, ctx } = query;

    const { items, total } = await this.appointmentRepo.findUpcomingReminders({
      clinicId: filter.clinicId,
      pagination: filter.pagination,
      hoursAhead: filter.hoursAhead,
    });

    return {
      data: items,
      meta: {
        pagination: buildPaginationMeta(filter.pagination, total),
        serializationOptions: this.policyFactory
          .appointment(ctx.actor, ctx.source)
          .policy.getSerializationOptions({ clinicId: filter.clinicId }),
      },
    };
  }
}
