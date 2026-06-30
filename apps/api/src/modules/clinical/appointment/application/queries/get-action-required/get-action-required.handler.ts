import { APPOINTMENT_EVENTS } from '@src/domain/constants/events';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetActionRequiredQuery } from './get-action-required.query';
import { GetActionRequiredQueryResponse } from './get-action-required.response';
import { BadRequestException, Inject } from '@nestjs/common';
import {
  APPOINTMENT_QUERY_REPOSITORY,
  IAppointmentQueryRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';

@QueryHandler(GetActionRequiredQuery)
export class GetActionRequiredHandler
  implements
    IQueryHandler<GetActionRequiredQuery, GetActionRequiredQueryResponse>
{
  constructor(
    @Inject(APPOINTMENT_QUERY_REPOSITORY)
    private readonly appointmentRepo: IAppointmentQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetActionRequiredQuery
  ): Promise<GetActionRequiredQueryResponse> {
    const { ctx, pagination } = query;
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
      .orThrow(APPOINTMENT_EVENTS.ACTION_REQUIRED);

    const { items, total } = await this.appointmentRepo.findActionRequired(
      actor.clinicId,
      pagination
    );

    return {
      data: items.map((item) => item.toPersistence()),
      meta: {
        pagination: buildPaginationMeta(pagination, total),
      },
    };
  }
}
