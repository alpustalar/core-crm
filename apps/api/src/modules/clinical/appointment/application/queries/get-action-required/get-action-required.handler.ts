import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetActionRequiredQuery } from './get-action-required.query';
import { GetActionRequiredQueryResponse } from './get-action-required.response';
import { Inject } from '@nestjs/common';
import {
  APPOINTMENT_QUERY_REPOSITORY,
  IAppointmentQueryRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

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
    const { ctx, pagination, clinicId } = query.payload;
    const { actor, source } = ctx;

    const { items, total } = await this.appointmentRepo.findActionRequired(
      clinicId,
      pagination
    );

    const serializationOptions = this.policyFactory
      .appointment(actor, source)
      .policy.getSerializationOptions({ clinicId });

    return {
      data: items,
      meta: {
        pagination: buildPaginationMeta(pagination, total),
        serializationOptions,
      },
    };
  }
}
